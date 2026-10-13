export interface OemVehicleSpec {
  keywords: string[];
  title: string;
  engineOil: string;
  transmissionBrakes: string;
  coolingSystem: string;
  ignitionElectrical: string;
  wheelsTires: string;
  serviceIntervals: string;
  notesTorque: string;
}

export const OEM_VEHICLE_DATABASE: OemVehicleSpec[] = [
  {
    keywords: ["atoz", "visto", "hyundai atoz", "kia visto"],
    title: "HYUNDAI ATOZ / KIA VISTO (1.0L G4HC & 1.1L G4HG)",
    engineOil: "SAE 10W-40 (API SL/SM/SN), Kapasitas: 3.1 Liter (dengan filter oli) / 2.8 Liter (tanpa filter oli).",
    transmissionBrakes: "Manual: MTF SAE 75W-85 (GL-4) 2.1L. Matic: ATF SP-III 2.1L (kuras reguler). Minyak rem: DOT 3 atau DOT 4.",
    coolingSystem: "Ethylene glycol 50/50 radiator coolant anti-rust, Kapasitas total: 4.5 Liter, Kuras berkala tiap 40.000 KM.",
    ignitionElectrical: "Busi standar: NGK BPR5EY-11 / Champion RN9YC (Celah gap elektroda 1.0 - 1.1 mm). Aki: 12V 35Ah - 40Ah (NS40ZL).",
    wheelsTires: "Ukuran ban: 155/70 R13 (standar pabrik). Tekanan angin: Depan 32 PSI (2.2 Bar), Belakang 30 PSI (2.1 Bar).",
    serviceIntervals: "Timing Belt: WAJIB diganti tiap 50.000 KM atau 3 tahun (Interference engine). Filter oli & oli tiap 5.000 KM.",
    notesTorque: "Torsi baut roda: 90 - 110 Nm. Periksa karet boot rack steer dan ball joint kolong bawah secara berkala.",
  },
  {
    keywords: ["avanza", "xenia", "toyota avanza", "daihatsu xenia", "veloz"],
    title: "TOYOTA AVANZA / DAIHATSU XENIA (1.3L K3-VE / 1.5L 3SZ-VE / 1NR-VE / 2NR-VE)",
    engineOil: "SAE 0W-20 atau 5W-30 (Dual VVT-i) / SAE 10W-40 (Non VVT-i). Kapasitas: 3.3L (dengan filter oli).",
    transmissionBrakes: "Manual: SAE 75W-90 GL-4 (2.2L). Matic: ATF Toyota T-IV / Toyota WS (3.0L drain-refill). Minyak rem: DOT 3.",
    coolingSystem: "Toyota Super Long Life Coolant (SLLC) 50/50 merah, Kapasitas: 5.0 Liter. Ganti tiap 80.000 KM.",
    ignitionElectrical: "Busi: Iridium Denso FK20HR11 / NGK LFR6C-11 (Celah gap 1.1 mm). Aki: 12V 35Ah (NS40Z) / 45Ah (NS60).",
    wheelsTires: "Ban: 185/65 R15 (Tipe G/Veloz) atau 185/70 R14 (Tipe E). Tekanan ban: Depan 33 PSI, Belakang 36-38 PSI (kondisi muatan).",
    serviceIntervals: "Timing Chain (bebas perawatan rutin, cek tiap 100.000 KM). Filter udara & kabin tiap 20.000 KM. Oli gardan belakang 80W-90 GL-5 tiap 40.000 KM.",
    notesTorque: "Torsi baut roda: 103 Nm. Lumasi cross joint kopel gardan berkala untuk cegah getar.",
  },
  {
    keywords: ["brio", "mobilio", "jazz", "brv", "hrv", "honda brio", "honda jazz"],
    title: "HONDA BRIO / MOBILIO / JAZZ / BR-V (1.2L & 1.5L L12/L15 i-VTEC)",
    engineOil: "SAE 0W-20 Honda E-Pro Green API SN/SP atau 5W-30. Kapasitas: 3.6 Liter (dengan filter) / 3.4L (tanpa filter).",
    transmissionBrakes: "CVT: Honda HCF-2 (3.4L kuras rutin tiap 30.000 KM, DILARANG ATF BIASA!). Manual: Honda MTF (1.5L). Rem: Honda DOT 3/4.",
    coolingSystem: "Honda All Season Coolant Type 2 (pre-mixed biru/hijau), Kapasitas: 4.2 Liter.",
    ignitionElectrical: "Busi: NGK DIFR6A13G / DILZKR6D11G Iridium Long-Life (Gap 1.1 - 1.3 mm). Aki: 12V 35Ah (34B19L / NS40ZL).",
    wheelsTires: "Brio: 175/65 R14 (Satya) / 185/55 R15 (RS). Tekanan ban: Depan 30 PSI, Belakang 28-30 PSI.",
    serviceIntervals: "Oli mesin tiap 5.000 - 10.000 KM. Oli matic CVT HCF-2 tiap 25.000 - 30.000 KM. Filter bensin tiap 60.000 KM.",
    notesTorque: "Torsi baut roda: 108 Nm. Jangan biarkan oli CVT telat ganti karena gearbox sangat sensitif terhadap panas.",
  },
  {
    keywords: ["agya", "ayla", "calya", "sigra", "toyota agya", "daihatsu ayla"],
    title: "DAIHATSU AYLA / TOYOTA AGYA / CALYA / SIGRA (1.0L 1KR-DE & 1.2L 3NR-VE)",
    engineOil: "SAE 0W-20 atau 5W-30 API SN/SP (Eco Friendly Oil). Kapasitas: 2.7L (1.0L) / 3.1L (1.2L dengan filter oli).",
    transmissionBrakes: "Manual: SAE 75W-90 (2.0L). Matic konvensional: ATF Dexron III / T-IV. D-CVT: D-CVT Fluid spesifik Daihatsu.",
    coolingSystem: "Daihatsu / Toyota Genuine Long Life Coolant, Kapasitas: 4.0 - 4.5 Liter.",
    ignitionElectrical: "Busi: Denso XU22PR9 / NGK LKR6C (Gap 0.9 - 1.0 mm). Aki: 12V 35Ah (NS40ZL).",
    wheelsTires: "Ban: 175/65 R14 (Standar Calya/Sigra/Agya 1.2) atau 155/80 R13 (Ayla 1.0). Tekanan: Depan 33 PSI, Belakang 36 PSI.",
    serviceIntervals: "Penggantian oli mesin tiap 7.000 - 10.000 KM. Kuras minyak rem tiap 40.000 KM atau 2 tahun.",
    notesTorque: "Torsi baut roda: 103 Nm. Periksa bushing arm depan dan karet support shock atas secara berkala.",
  },
  {
    keywords: ["innova", "fortuner", "hilux", "kijang innova"],
    title: "TOYOTA KIJANG INNOVA (2.0L 1TR-FE Bensin & 2.4L/2.5L 2GD/2KD Diesel D-4D)",
    engineOil: "Bensin: SAE 5W-30 / 10W-40 (5.6L). Diesel: SAE 5W-30 / 10W-30 ACEA C2/B4 Diesel Synthetic (6.8L - 7.5L dengan filter).",
    transmissionBrakes: "Manual: SAE 75W-90 (2.2L). Matic: Toyota ATF WS (World Standard) kuras per 40.000 KM. Gardan: SAE 85W-90 GL-5.",
    coolingSystem: "Toyota Super Long Life Coolant (SLLC) merah muda, Kapasitas: 8.5 Liter (Bensin) / 9.2 Liter (Diesel).",
    ignitionElectrical: "Bensin: Denso SK20HR11 Iridium. Diesel: Glow plug pemanas 11V. Aki: Bensin 55D23L (60Ah), Diesel 80D26L (70-75Ah).",
    wheelsTires: "Ban: 205/65 R16 atau 215/55 R17 (Venturer). Tekanan ban: 33 PSI (Depan & Belakang).",
    serviceIntervals: "Diesel: Filter solar wajib ganti tiap 20.000 KM / saat indikator menyala. Oli mesin 5.000 - 10.000 KM.",
    notesTorque: "Torsi baut roda: 112 Nm. Gemuk sasis & cross joint kopel propeler shaft tiap 10.000 KM.",
  },
  {
    keywords: ["ertiga", "xl7", "karimun", "wagon r", "suzuki ertiga", "suzuki karimun"],
    title: "SUZUKI ERTIGA / XL7 / KARIMUN WAGON R (K14B / K15B / K10B)",
    engineOil: "SAE 0W-20 Suzuki Ecstar (K15B) atau SAE 5W-30 (K14B / K10B). Kapasitas: 3.1L (Wagon R) / 3.4L (Ertiga w/ filter).",
    transmissionBrakes: "Manual: Suzuki Gear Oil 75W-90 (2.2L). Matic 4AT: Suzuki ATF 3317 / Mobil ATF 3309 (2.5L). Minyak rem: DOT 3.",
    coolingSystem: "Suzuki Super Long Life Coolant (biru/hijau), Kapasitas: 4.8 Liter.",
    ignitionElectrical: "Busi: NGK KR6A-10 / Iridium ILKR6F11 (Gap 1.0 mm). Aki: 12V 35Ah (Karimun) / 45Ah (Ertiga).",
    wheelsTires: "Wagon R: 145/80 R13 (32 PSI). Ertiga/XL7: 185/65 R15 atau 195/60 R16 (33 PSI Depan, 36 PSI Belakang).",
    serviceIntervals: "Oli mesin tiap 5.000 - 10.000 KM. Fan belt & tensioner periksa tiap 30.000 KM.",
    notesTorque: "Torsi baut roda: 95 - 100 Nm. Bersihkan throttle body tiap 20.000 KM untuk cegah idle drop.",
  },
];

/**
 * Format string profil AI terkompresi
 */
export function formatOemProfile(spec: OemVehicleSpec): string {
  return `[PROFIL PENGETAHUAN AI RESMI - ${spec.title}]
• Pelumasan Mesin: ${spec.engineOil}
• Transmisi & Pengereman: ${spec.transmissionBrakes}
• Sistem Pendingin: ${spec.coolingSystem}
• Pengapian & Kelistrikan: ${spec.ignitionElectrical}
• Kaki-Kaki & Ban: ${spec.wheelsTires}
• Interval Servis Wajib: ${spec.serviceIntervals}
• Catatan Khusus & Torsi: ${spec.notesTorque}`;
}

/**
 * Mencari profil spesifikasi teknis pabrikan resmi berdasarkan merek & model mobil
 */
export function findOemCarSpec(query: string): string {
  const q = query.toLowerCase().trim();
  
  for (const item of OEM_VEHICLE_DATABASE) {
    if (item.keywords.some((k) => q.includes(k))) {
      return formatOemProfile(item);
    }
  }

  // Fallback standar pabrikan umum yang aman untuk iklim tropis Indonesia
  const cleanTitle = query.toUpperCase().trim() || "KENDARAAN STANDAR OEM";
  return `[PROFIL PENGETAHUAN AI RESMI - ${cleanTitle}]
• Pelumasan Mesin: SAE 5W-30 (Modern) atau SAE 10W-40 (Tahun 2012 ke bawah) API SN/SP, Kapasitas: 3.2 - 4.0 Liter (dengan filter oli).
• Transmisi & Pengereman: Gunakan pelumas standar OEM pabrikan (MTF 75W-90 / ATF SP-III/WS / CVT-F), Minyak rem: DOT 3 atau DOT 4.
• Sistem Pendingin: Ethylene glycol 50/50 radiator coolant anti-karat, Kapasitas: 4.5 - 5.5 Liter, Kuras berkala tiap 40.000 KM.
• Pengapian & Kelistrikan: Busi elektroda standar / iridium (Celah gap 1.0 - 1.1 mm), Aki 12V 35Ah - 60Ah tegangan normal 12.6V (13.8V-14.4V saat mesin hidup).
• Kaki-Kaki & Ban: Tekanan ban standar harian: Depan 32-34 PSI, Belakang 32-36 PSI (kondisi dingin).
• Interval Servis Wajib: Ganti oli mesin tiap 5.000 - 10.000 KM, Ganti filter oli tiap ganti oli, Kuras cairan transmisi tiap 30.000 - 40.000 KM.
• Catatan Khusus & Torsi: Torsi baut roda standar: 100 - 110 Nm. Periksa ketegangan drive belt (fanbelt) dan kondisi karet wiper berkala.`;
}
