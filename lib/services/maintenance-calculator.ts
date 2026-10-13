import { CalculateMaintenanceInput, MaintenanceStatusSummary } from "@/types/maintenance";
import { ServiceRecommendation, UrgencyLevel } from "@/types/automotive";

interface StandardInterval {
  category: ServiceRecommendation["category"];
  title: string;
  intervalKm: number;
  intervalMonths: number;
  estimatedCostRange: string;
  plainDescription: string;
  safetyTip: string;
}

const AUTOMOTIVE_INTERVALS: StandardInterval[] = [
  {
    category: "OLI_MESIN",
    title: "Ganti Oli Mesin & Filter Oli",
    intervalKm: 10000,
    intervalMonths: 6,
    estimatedCostRange: "Rp 350.000 - Rp 650.000 (Oli Sintetik + Filter)",
    plainDescription:
      "Oli adalah 'darah' mesin mobil Anda. Mengganti oli tepat waktu menjaga komponen dalam mesin tetap dingin, bersih, dan bebas gesekan kasar saat dipacu di tanjakan atau macet.",
    safetyTip:
      "Pastikan mesin dalam keadaan mati dan sudah dingin minimal 30 menit sebelum membuka baut pembuangan oli agar tangan Anda terhindar dari luka bakar minyak panas.",
  },
  {
    category: "OLI_TRANSMISI",
    title: "Kuras / Ganti Oli Transmisi (Matic / Manual)",
    intervalKm: 40000,
    intervalMonths: 24,
    estimatedCostRange: "Rp 400.000 - Rp 900.000",
    plainDescription:
      "Cairan transmisi menjaga perpindahan gigi tetap mulus dan responsif tanpa sentakan (jedug) yang bikin was-was saat melaju.",
    safetyTip:
      "Gunakan spesifikasi oli matic (ATF/CVTF) yang tertera persis di buku manual mobil Anda. Jangan sembarangan mencampur jenis oli matic.",
  },
  {
    category: "FILTER_UDARA",
    title: "Pembersihan / Penggantian Filter Udara Mesin",
    intervalKm: 15000,
    intervalMonths: 12,
    estimatedCostRange: "Rp 85.000 - Rp 180.000",
    plainDescription:
      "Menyaring debu jalanan agar ruang bakar mendapat oksigen bersih. Filter yang bersih membuat konsumsi bensin terasa lebih irit dan tarikan gas lebih enteng.",
    safetyTip:
      "Klip kotak saringan udara harus terkunci rapat kembali agar debu pasir jalanan tidak langsung terhisap masuk ke dalam ruang silinder mesin.",
  },
  {
    category: "KAMPAS_REM",
    title: "Inspeksi Ketebalan Kampas Rem & Minyak Rem",
    intervalKm: 25000,
    intervalMonths: 12,
    estimatedCostRange: "Rp 250.000 - Rp 600.000 (Depan Sepasang)",
    plainDescription:
      "Kampas rem memastikan mobil berhenti stabil saat pengereman mendadak. Jika terdengar bunyi decit atau pijakan pedal rem terasa lebih dalam, segera lakukan pengecekan.",
    safetyTip:
      "BAHAYA JATUH: Jangan pernah hanya mengandalkan dongkrak bawaan saat melepas roda. Selalu gunakan Jack Stand yang terpasang kokoh pada titik sasis mobil!",
  },
  {
    category: "BUSI",
    title: "Pemeriksaan / Penggantian Busi Pengapian",
    intervalKm: 40000,
    intervalMonths: 24,
    estimatedCostRange: "Rp 100.000 - Rp 350.000 (1 Set 4 Pcs)",
    plainDescription:
      "Pemicu percikan api di ruang bakar. Busi yang prima mencegah mesin pincang bergetar dan menjaga akselerasi tetap bertenaga.",
    safetyTip:
      "Kencangkan busi dengan torsi yang pas sesuai anjuran pabrikan; jangan terlalu kencang agar ulir lubang busi di blok silinder tidak patah atau dol.",
  },
];

export function calculateNextService(
  input: CalculateMaintenanceInput
): MaintenanceStatusSummary {
  const currentOdometer = Math.max(0, input.currentOdometer);
  const lastOdometer = input.lastOdometerService ?? 0;
  const deltaKm = Math.max(0, currentOdometer - lastOdometer);

  // Hitung selisih bulan dari servis terakhir
  let deltaMonths = 0;
  if (input.lastServiceDate) {
    const lastDate = new Date(input.lastServiceDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    deltaMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  }

  const recommendations: ServiceRecommendation[] = AUTOMOTIVE_INTERVALS.map(
    (item, index) => {
      // Jarak siklus servis yang tersisa
      const kmSinceCycle = currentOdometer % item.intervalKm;
      const kmRemaining = item.intervalKm - kmSinceCycle;

      // Estimasi hari tersisa berdasarkan rata-rata 35 km/hari di Indonesia
      const daysRemainingFromKm = Math.round(kmRemaining / 35);
      const monthsRemainingFromDate = Math.max(0, item.intervalMonths - deltaMonths);
      const daysRemainingFromDate = monthsRemainingFromDate * 30;

      const estimatedDaysRemaining = Math.min(
        daysRemainingFromKm,
        daysRemainingFromDate > 0 ? daysRemainingFromDate : daysRemainingFromKm
      );

      let urgency: UrgencyLevel = "SAFE";
      if (kmRemaining <= 0 || estimatedDaysRemaining <= 0) {
        urgency = "OVERDUE";
      } else if (kmRemaining <= 1500 || estimatedDaysRemaining <= 30) {
        urgency = "UPCOMING";
      }

      let friendlyMessage = "";
      if (urgency === "OVERDUE") {
        friendlyMessage = `Waktunya servis! Kilometer sudah melewati interval rekomendasi. Segera luangkan waktu agar performa mobil tetap aman dan nyaman.`;
      } else if (urgency === "UPCOMING") {
        friendlyMessage = `Persiapan servis dalam ${kmRemaining.toLocaleString(
          "id-ID"
        )} km lagi (estimasi ${estimatedDaysRemaining} hari). Anda bisa mulai menyisihkan anggaran santai.`;
      } else {
        friendlyMessage = `Kondisi aman. Masih tersisa ${kmRemaining.toLocaleString(
          "id-ID"
        )} km perjalanan sebelum perlu penggantian berikutnya.`;
      }

      return {
        id: `rec-${index + 1}`,
        category: item.category,
        title: item.title,
        urgency,
        distanceRemainingKm: kmRemaining,
        daysRemaining: estimatedDaysRemaining,
        estimatedCostRange: item.estimatedCostRange,
        userFriendlyDescription: `${item.plainDescription} ${friendlyMessage}`,
        safetyInstruction: item.safetyTip,
      };
    }
  );

  const urgentCount = recommendations.filter((r) => r.urgency === "OVERDUE").length;
  const upcomingCount = recommendations.filter((r) => r.urgency === "UPCOMING").length;

  let overallHealth: MaintenanceStatusSummary["overallHealth"] = "PRIMA";
  if (urgentCount > 0) {
    overallHealth = "BUTUH_SERVIS";
  } else if (upcomingCount > 0) {
    overallHealth = "PERHATIAN";
  }

  return {
    overallHealth,
    recommendations,
    urgentCount,
    upcomingCount,
  };
}
