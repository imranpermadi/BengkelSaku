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

// GET /api/maintenance - Ambil catatan servis dari database
export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const url = new URL(req.url);
    const vehicleId = url.searchParams.get("vehicleId");

    const logs = await prisma.maintenanceLog.findMany({
      where: {
        vehicle: {
          userId: user.id,
          ...(vehicleId ? { id: vehicleId } : {}),
        },
      },
      orderBy: { serviceDate: "desc" },
      include: {
        vehicle: true,
      },
    });

    const formattedLogs = logs.map((l) => ({
      id: l.id,
      vehicleId: l.vehicleId,
      vehicleName:
        l.vehicleName ||
        `${l.vehicle.make} ${l.vehicle.model} (${l.vehicle.licensePlate || "Tanpa Plat"})`,
      serviceType: l.serviceType,
      odometerAt: l.odometerAt,
      serviceDate: l.serviceDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      cost: l.cost ? `Rp ${Number(l.cost).toLocaleString("id-ID")}` : "Rp 0",
      workshopName: l.workshopName || "Bengkel Mandiri",
      notes: l.notes || "",
      status: (l.status as any) || "SELESAI",
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error: any) {
    console.error("[GET /api/maintenance ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal mengambil log servis dari database", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - Simpan log servis ke database
export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const body = await req.json();

    // Dukung batch migration
    if (Array.isArray(body.logs)) {
      const createdList = [];
      for (const item of body.logs) {
        // Cari mobil yang cocok
        let veh = null;
        if (item.vehicleId) {
          veh = await prisma.vehicleProfile.findFirst({
            where: { id: item.vehicleId, userId: user.id },
          });
        }
        if (!veh) {
          veh = await prisma.vehicleProfile.findFirst({
            where: { userId: user.id },
          });
        }

        if (veh) {
          // Parse cost
          const cleanCost = item.cost
            ? String(item.cost).replace(/[^0-9]/g, "")
            : "0";

          const created = await prisma.maintenanceLog.create({
            data: {
              id: item.id && item.id.startsWith("log-") ? item.id : undefined,
              vehicleId: veh.id,
              vehicleName: item.vehicleName || `${veh.make} ${veh.model}`,
              serviceType: item.serviceType || "Servis Berkala",
              odometerAt: Number(item.odometerAt) || veh.currentOdometer,
              serviceDate: item.serviceDate ? new Date(item.serviceDate) : new Date(),
              cost: Number(cleanCost) || 0,
              workshopName: item.workshopName || "Bengkel Resmi",
              notes: item.notes || null,
              status: item.status || "SELESAI",
            },
          });
          createdList.push(created);
        }
      }
      return NextResponse.json({ success: true, count: createdList.length });
    }

    const {
      vehicleId,
      vehicleName,
      serviceType,
      odometerAt,
      serviceDate,
      cost,
      workshopName,
      notes,
      status,
    } = body;

    let targetVeh = null;
    if (vehicleId) {
      targetVeh = await prisma.vehicleProfile.findFirst({
        where: { id: vehicleId, userId: user.id },
      });
    }
    if (!targetVeh) {
      targetVeh = await prisma.vehicleProfile.findFirst({
        where: { userId: user.id },
      });
    }

    if (!targetVeh) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan di database. Daftarkan mobil di Garasi terlebih dahulu." },
        { status: 404 }
      );
    }

    const cleanCost = cost ? String(cost).replace(/[^0-9]/g, "") : "0";

    const newLog = await prisma.maintenanceLog.create({
      data: {
        vehicleId: targetVeh.id,
        vehicleName:
          vehicleName ||
          `${targetVeh.make} ${targetVeh.model} (${targetVeh.licensePlate || "Tanpa Plat"})`,
        serviceType: serviceType || "Perawatan Berkala",
        odometerAt: Number(odometerAt) || targetVeh.currentOdometer,
        serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
        cost: Number(cleanCost) || 0,
        workshopName: workshopName || "Bengkel Resmi",
        notes: notes || null,
        status: status || "SELESAI",
      },
    });

    // Perbarui odometer dan tanggal servis terakhir di VehicleProfile jika lebih tinggi
    const newKm = Math.max(targetVeh.currentOdometer, Number(odometerAt) || 0);
    await prisma.vehicleProfile.update({
      where: { id: targetVeh.id },
      data: {
        currentOdometer: newKm,
        lastServiceDate: serviceDate ? new Date(serviceDate) : new Date(),
      },
    });

    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/maintenance ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan catatan servis ke database", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/maintenance - Hapus log servis dari database
export async function DELETE(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const url = new URL(req.url);
    const logId = url.searchParams.get("id");

    if (!logId) {
      return NextResponse.json({ error: "Parameter id catatan servis wajib disertakan." }, { status: 400 });
    }

    await prisma.maintenanceLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({ success: true, deletedId: logId });
  } catch (error: any) {
    console.error("[DELETE /api/maintenance ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal menghapus catatan servis dari database", details: error.message },
      { status: 500 }
    );
  }
}
