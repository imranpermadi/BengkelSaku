const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "imranpermadi@gmail.com" },
  });

  if (!user) {
    console.log("User imranpermadi@gmail.com not found");
    return;
  }
  console.log("Found user in PostgreSQL:", user.name, "(", user.email, ")");

  // 1. VehicleProfile
  let vehicle = await prisma.vehicleProfile.findFirst({
    where: { userId: user.id },
  });

  if (!vehicle) {
    vehicle = await prisma.vehicleProfile.create({
      data: {
        userId: user.id,
        make: "Hyundai",
        model: "Atoz 1.0 GLS",
        year: 2002,
        licensePlate: "B 2002 AZ",
        currentOdometer: 135000,
        imageUrl:
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
        manualFileName: "Spesifikasi Resmi Pabrikan (Hyundai Atoz 2002)",
        manualGuideText: `[PROFIL PENGETAHUAN AI RESMI - HYUNDAI_ATOZ_2002]
• Pelumasan Mesin: SAE 10W-40 (API SL/SM/SN), Kapasitas: 3.1 Liter (dengan filter oli) / 2.8 Liter (tanpa filter oli).
• Transmisi & Pengereman: Manual: MTF SAE 75W-85 (GL-4) 2.1L. Matic: ATF SP-III 2.1L (kuras reguler). Minyak rem: DOT 3 atau DOT 4.
• Sistem Pendingin: Ethylene glycol 50/50 radiator coolant anti-rust, Kapasitas total: 4.5 Liter, Kuras berkala tiap 40.000 KM.
• Pengapian & Kelistrikan: Busi standar: NGK BPR5EY-11 / Champion RN9YC. Aki: 12V 35Ah - 40Ah (NS40ZL).
• Kaki-Kaki & Ban: Ukuran ban: 155/70 R13. Tekanan angin: Depan 32 PSI (2.2 Bar), Belakang 30 PSI (2.1 Bar).
• Interval Servis Wajib: Timing Belt: WAJIB diganti tiap 50.000 KM atau 3 tahun (Interference engine). Filter oli & oli tiap 5.000 KM.
• Catatan Khusus: Torsi baut roda: 90 - 110 Nm. Periksa karet boot rack steer dan ball joint kolong bawah secara berkala.`,
      },
    });
    console.log("Berhasil membuat VehicleProfile:", vehicle.id, vehicle.make, vehicle.model);
  } else {
    console.log("VehicleProfile sudah ada:", vehicle.id, vehicle.make, vehicle.model);
  }

  // 2. MaintenanceLog
  const existingLog = await prisma.maintenanceLog.findFirst({
    where: { vehicleId: vehicle.id },
  });

  if (!existingLog) {
    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicle.id,
        vehicleName: "Hyundai Atoz 1.0 GLS (B 2002 AZ)",
        serviceType: "Ganti Oli Mesin & Filter Oli",
        odometerAt: 130000,
        serviceDate: new Date("2026-08-15"),
        cost: 350000,
        workshopName: "Bengkel Resmi Hyundai",
        notes: "Oli Shell Helix HX6 10W-40 3.1L dan penggantian filter oli OEM.",
        status: "SELESAI",
      },
    });
    console.log("Berhasil membuat MaintenanceLog:", log.id, log.serviceType);
  } else {
    console.log("MaintenanceLog sudah ada:", existingLog.id);
  }

  // 3. TargetCar
  const existingTarget = await prisma.targetCar.findFirst({
    where: { userId: user.id },
  });

  if (!existingTarget) {
    const target = await prisma.targetCar.create({
      data: {
        userId: user.id,
        title: "Hyundai Atoz 1.0 GLS Manual 2002 Orisinil",
        make: "Hyundai",
        model: "Atoz",
        year: 2002,
        transmission: "Manual",
        askingPrice: 38000000,
        askingPriceFormatted: "Rp 38.000.000",
        odometer: 135000,
        sellerDescription:
          "Bismillah dijual Hyundai Atoz tahun 2002 pemakaian pribadi. Kondisi mesin kering halus no rembes, AC dingin menggigil, power window aktif, surat lengkap BPKB STNK faktur hidup, pajak on. Kaki-kaki senyap siap pakai luar kota.",
        sellerClaims: [
          "Mesin kering halus no rembes",
          "AC dingin menggigil",
          "Kaki-kaki senyap siap luar kota",
          "Surat lengkap & pajak hidup",
        ],
        imageUrl:
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
        ],
        sourcePlatform: "Facebook Marketplace",
        sourceUrl: "https://www.facebook.com/share/1C5o2XWn16/",
      },
    });
    console.log("Berhasil membuat TargetCar:", target.id, target.title);
  } else {
    console.log("TargetCar sudah ada:", existingTarget.id);
  }

  // 4. ChatMessage
  const existingChat = await prisma.chatMessage.findFirst({
    where: { userId: user.id },
  });

  if (!existingChat) {
    const chat = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: "assistant",
        content:
          "Halo Pak Imran! Saya TORQ AI, asisten mekanik dan konsultan otomotif digital Anda. Seluruh data mobil garasi, catatan servis berkala, dan mobil incaran Anda kini telah tersinkronisasi aman di database PostgreSQL.",
      },
    });
    console.log("Berhasil membuat ChatMessage:", chat.id);
  } else {
    console.log("ChatMessage sudah ada:", existingChat.id);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

