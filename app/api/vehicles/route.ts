import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

async function resolveUser(req: NextRequest) {
  // 1. Coba dari session NextAuth resmi
  try {
    const session = await auth();
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (dbUser) return dbUser;
    }
  } catch (err) {
    console.warn("[AUTH API SESSION RESOLVE]:", err);
  }

  // 2. Coba dari query param atau header
  const url = new URL(req.url);
  const emailOrId = url.searchParams.get("userKey") || url.searchParams.get("email");

  if (emailOrId && emailOrId !== "default" && emailOrId !== "default_user") {
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: emailOrId }, { email: emailOrId }],
      },
    });

    if (!dbUser) {
      const email = emailOrId.includes("@") ? emailOrId : `${emailOrId}@bengkelsaku.local`;
      const name = emailOrId.includes("@") ? emailOrId.split("@")[0] : emailOrId;
      dbUser = await prisma.user.create({
        data: { email, name },
      });
    }
    return dbUser;
  }

  // 3. Fallback ke user pertama di DB atau buat default user
  let fallbackUser = await prisma.user.findFirst();
  if (!fallbackUser) {
    fallbackUser = await prisma.user.create({
      data: {
        email: "pemilik@bengkelsaku.id",
        name: "Pemilik Mobil BengkelSaku",
      },
    });
  }
  return fallbackUser;
}

// GET /api/vehicles - Ambil daftar mobil garasi dari database PostgreSQL
export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const profiles = await prisma.vehicleProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        maintenanceLogs: {
          orderBy: { serviceDate: "desc" },
        },
      },
    });

    // Format agar cocok dengan antarmuka frontend Vehicle
    const formattedVehicles = profiles.map((p) => ({
      id: p.id,
      userId: p.userId,
      make: p.make,
      model: p.model,
      year: p.year,
      licensePlate: p.licensePlate,
      vin: p.vin,
      currentOdometer: p.currentOdometer,
      lastServiceDate: p.lastServiceDate ? p.lastServiceDate.toISOString() : null,
      imageUrl: p.imageUrl,
      images: p.images || [],
      manualGuideText: p.manualGuideText,
      manualFileName: p.manualFileName,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      vehicles: formattedVehicles,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    console.error("[GET /api/vehicles ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data mobil dari database", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Simpan mobil baru ke database PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const body = await req.json();

    // Dukung migrasi batch dari localStorage jika dikirim { vehicles: [...] }
    if (Array.isArray(body.vehicles)) {
      const createdList = [];
      for (const v of body.vehicles) {
        const existing = await prisma.vehicleProfile.findFirst({
          where: {
            userId: user.id,
            OR: [
              { id: v.id },
              {
                make: v.make,
                model: v.model,
                year: Number(v.year),
                licensePlate: v.licensePlate || null,
              },
            ],
          },
        });

        if (existing) {
          const updated = await prisma.vehicleProfile.update({
            where: { id: existing.id },
            data: {
              currentOdometer: Number(v.currentOdometer) || existing.currentOdometer,
              manualGuideText: v.manualGuideText || existing.manualGuideText,
              manualFileName: v.manualFileName || existing.manualFileName,
              imageUrl: v.imageUrl || existing.imageUrl,
              images: Array.isArray(v.images) ? v.images : existing.images,
            },
          });
          createdList.push(updated);
        } else {
          const created = await prisma.vehicleProfile.create({
            data: {
              id: v.id && v.id.startsWith("veh-") ? v.id : undefined,
              userId: user.id,
              make: v.make || "Toyota",
              model: v.model || "Avanza",
              year: Number(v.year) || 2020,
              licensePlate: v.licensePlate || null,
              vin: v.vin || null,
              currentOdometer: Number(v.currentOdometer) || 0,
              lastServiceDate: v.lastServiceDate ? new Date(v.lastServiceDate) : null,
              imageUrl: v.imageUrl || null,
              images: Array.isArray(v.images) ? v.images : [],
              manualGuideText: v.manualGuideText || null,
              manualFileName: v.manualFileName || null,
            },
          });
          createdList.push(created);
        }
      }
      return NextResponse.json({ success: true, count: createdList.length, vehicles: createdList });
    }

    // Single create
    const {
      id,
      make,
      model,
      year,
      licensePlate,
      vin,
      currentOdometer,
      lastServiceDate,
      imageUrl,
      images,
      manualGuideText,
      manualFileName,
    } = body;

    const newProfile = await prisma.vehicleProfile.create({
      data: {
        id: id && id.startsWith("veh-") ? id : undefined,
        userId: user.id,
        make: make || "Mobil Baru",
        model: model || "Standar",
        year: Number(year) || new Date().getFullYear(),
        licensePlate: licensePlate || null,
        vin: vin || null,
        currentOdometer: Number(currentOdometer) || 0,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
        imageUrl: imageUrl || null,
        images: Array.isArray(images) ? images : [],
        manualGuideText: manualGuideText || null,
        manualFileName: manualFileName || null,
      },
    });

    return NextResponse.json({ success: true, vehicle: newProfile }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/vehicles ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan mobil ke database PostgreSQL", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles - Perbarui mobil yang sudah ada
export async function PUT(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      make,
      model,
      year,
      licensePlate,
      vin,
      currentOdometer,
      lastServiceDate,
      imageUrl,
      images,
      manualGuideText,
      manualFileName,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID mobil wajib disertakan." }, { status: 400 });
    }

    const updated = await prisma.vehicleProfile.update({
      where: { id },
      data: {
        make: make !== undefined ? make : undefined,
        model: model !== undefined ? model : undefined,
        year: year !== undefined ? Number(year) : undefined,
        licensePlate: licensePlate !== undefined ? licensePlate : undefined,
        vin: vin !== undefined ? vin : undefined,
        currentOdometer: currentOdometer !== undefined ? Number(currentOdometer) : undefined,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        images: Array.isArray(images) ? images : undefined,
        manualGuideText: manualGuideText !== undefined ? manualGuideText : undefined,
        manualFileName: manualFileName !== undefined ? manualFileName : undefined,
      },
    });

    return NextResponse.json({ success: true, vehicle: updated });
  } catch (error: any) {
    console.error("[PUT /api/vehicles ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui mobil di database", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles - Hapus mobil dari database
export async function DELETE(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const url = new URL(req.url);
    const vehicleId = url.searchParams.get("id");

    if (!vehicleId) {
      return NextResponse.json({ error: "Parameter id mobil wajib disertakan." }, { status: 400 });
    }

    await prisma.vehicleProfile.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({ success: true, deletedId: vehicleId });
  } catch (error: any) {
    console.error("[DELETE /api/vehicles ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal menghapus mobil dari database", details: error.message },
      { status: 500 }
    );
  }
}
