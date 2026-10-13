import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

async function resolveUser(req: NextRequest) {
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

// GET /api/target-cars - Ambil mobil incaran tersimpan dari PostgreSQL
export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const cars = await prisma.targetCar.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const formatted = cars.map((c) => ({
      id: c.id,
      userId: c.userId,
      title: c.title,
      make: c.make,
      model: c.model,
      year: c.year,
      transmission: c.transmission as "Manual" | "Matic",
      askingPrice: Number(c.askingPrice) || 0,
      askingPriceFormatted:
        c.askingPriceFormatted ||
        `Rp ${Number(c.askingPrice || 0).toLocaleString("id-ID")}`,
      odometer: c.odometer,
      sellerDescription: c.sellerDescription || "",
      sellerClaims: c.sellerClaims || [],
      imageUrl: c.imageUrl || "",
      images: c.images || [],
      sourceUrl: c.sourceUrl || undefined,
      sourcePlatform: c.sourcePlatform || undefined,
      manualGuideText: c.manualGuideText,
      manualFileName: c.manualFileName,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ cars: formatted });
  } catch (error: any) {
    console.error("[GET /api/target-cars ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data mobil incaran dari database", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/target-cars - Simpan mobil incaran ke PostgreSQL
export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const body = await req.json();

    // Dukung batch migration
    if (Array.isArray(body.cars)) {
      const createdList = [];
      for (const item of body.cars) {
        const cleanPrice = item.askingPrice
          ? Number(item.askingPrice)
          : Number(String(item.askingPriceFormatted || "0").replace(/[^0-9]/g, "")) || 0;

        const created = await prisma.targetCar.create({
          data: {
            id: item.id && item.id.startsWith("target-") ? item.id : undefined,
            userId: user.id,
            title: item.title || `${item.make || "Mobil"} ${item.model || "Incaran"}`,
            make: item.make || "Lainnya",
            model: item.model || "Standar",
            year: Number(item.year) || 2020,
            transmission: item.transmission || "Manual",
            askingPrice: cleanPrice,
            askingPriceFormatted: item.askingPriceFormatted || `Rp ${cleanPrice.toLocaleString("id-ID")}`,
            odometer: Number(item.odometer) || 0,
            sellerDescription: item.sellerDescription || "",
            sellerClaims: item.sellerClaims || [],
            imageUrl: item.imageUrl || (item.images && item.images[0]) || "",
            images: item.images || [],
            sourceUrl: item.sourceUrl || null,
            sourcePlatform: item.sourcePlatform || null,
            manualGuideText: item.manualGuideText || null,
            manualFileName: item.manualFileName || null,
          },
        });
        createdList.push(created);
      }
      return NextResponse.json({ success: true, count: createdList.length });
    }

    const cleanPrice = body.askingPrice
      ? Number(body.askingPrice)
      : Number(String(body.askingPriceFormatted || "0").replace(/[^0-9]/g, "")) || 0;

    const newTarget = await prisma.targetCar.create({
      data: {
        id: body.id && body.id.startsWith("target-") ? body.id : undefined,
        userId: user.id,
        title: body.title || `${body.make || "Mobil"} ${body.model || "Incaran"}`,
        make: body.make || "Lainnya",
        model: body.model || "Standar",
        year: Number(body.year) || 2020,
        transmission: body.transmission || "Manual",
        askingPrice: cleanPrice,
        askingPriceFormatted: body.askingPriceFormatted || `Rp ${cleanPrice.toLocaleString("id-ID")}`,
        odometer: Number(body.odometer) || 0,
        sellerDescription: body.sellerDescription || "",
        sellerClaims: body.sellerClaims || [],
        imageUrl: body.imageUrl || (body.images && body.images[0]) || "",
        images: body.images || [],
        sourceUrl: body.sourceUrl || null,
        sourcePlatform: body.sourcePlatform || null,
        manualGuideText: body.manualGuideText || null,
        manualFileName: body.manualFileName || null,
      },
    });

    return NextResponse.json({ success: true, car: newTarget }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/target-cars ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan mobil incaran ke database", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/target-cars - Perbarui mobil incaran
export async function PUT(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID mobil incaran wajib disertakan." }, { status: 400 });
    }

    const cleanPrice = body.askingPrice !== undefined
      ? Number(body.askingPrice)
      : body.askingPriceFormatted
      ? Number(String(body.askingPriceFormatted).replace(/[^0-9]/g, ""))
      : undefined;

    const updated = await prisma.targetCar.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        make: body.make !== undefined ? body.make : undefined,
        model: body.model !== undefined ? body.model : undefined,
        year: body.year !== undefined ? Number(body.year) : undefined,
        transmission: body.transmission !== undefined ? body.transmission : undefined,
        askingPrice: cleanPrice !== undefined ? cleanPrice : undefined,
        askingPriceFormatted: body.askingPriceFormatted !== undefined ? body.askingPriceFormatted : undefined,
        odometer: body.odometer !== undefined ? Number(body.odometer) : undefined,
        sellerDescription: body.sellerDescription !== undefined ? body.sellerDescription : undefined,
        sellerClaims: body.sellerClaims !== undefined ? body.sellerClaims : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        images: body.images !== undefined ? body.images : undefined,
        sourceUrl: body.sourceUrl !== undefined ? body.sourceUrl : undefined,
        sourcePlatform: body.sourcePlatform !== undefined ? body.sourcePlatform : undefined,
        manualGuideText: body.manualGuideText !== undefined ? body.manualGuideText : undefined,
        manualFileName: body.manualFileName !== undefined ? body.manualFileName : undefined,
      },
    });

    return NextResponse.json({ success: true, car: updated });
  } catch (error: any) {
    console.error("[PUT /api/target-cars ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui mobil incaran di database", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/target-cars - Hapus mobil incaran dari database
export async function DELETE(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const url = new URL(req.url);
    const carId = url.searchParams.get("id");

    if (!carId) {
      return NextResponse.json({ error: "Parameter id wajib disertakan." }, { status: 400 });
    }

    await prisma.targetCar.delete({
      where: { id: carId },
    });

    return NextResponse.json({ success: true, deletedId: carId });
  } catch (error: any) {
    console.error("[DELETE /api/target-cars ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal menghapus mobil incaran dari database", details: error.message },
      { status: 500 }
    );
  }
}
