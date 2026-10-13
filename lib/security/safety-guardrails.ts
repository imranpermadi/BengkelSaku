// OWASP ASI-08: Deterministic Safety Guardrails for Automotive Physical Risks

export interface HazardEvaluation {
  isCriticalHazard: boolean;
  detectedHazardName?: string;
  recommendedAction?: string;
}

const CRITICAL_KEYWORDS = [
  { keyword: "airbag", name: "Modul Airbag SRS (Bahan Peledak Pirosel)" },
  { keyword: "kabel oranye", name: "Kabel Tegangan Tinggi Hybrid/EV (Tersengat 300V-600V)" },
  { keyword: "rem blong total", name: "Kegagalan Sistem Hidrolik Rem Utama" },
  { keyword: "bocoran bensin deras", name: "Kebocoran Jalur Bahan Bakar Tekanan Tinggi (Risiko Api)" },
];

export function evaluateAutomotiveHazard(complaint: string): HazardEvaluation {
  const lower = complaint.toLowerCase();

  for (const item of CRITICAL_KEYWORDS) {
    if (lower.includes(item.keyword)) {
      return {
        isCriticalHazard: true,
        detectedHazardName: item.name,
        recommendedAction:
          "PERINGATAN BAHAYA FATAL: Masalah ini menyangkut sistem keselamatan kritis yang TIDAK BOLEH dikerjakan sendiri oleh mekanik otodidak tanpa sertifikasi alat pelindung khusus. Segera hubungi mobil derek (towing) dan bawa ke Bengkel Resmi.",
      };
    }
  }

  return { isCriticalHazard: false };
}
