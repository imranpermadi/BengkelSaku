"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Crosshair,
  Sparkles,
  Search,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShoppingBag,
  Info,
  Car,
  Layers,
  ChevronRight,
  Eye,
  Maximize2,
  Gauge,
  Flame,
  Zap,
  HelpCircle,
  Filter,
  Check,
  Compass,
  Activity,
  Cpu,
  RefreshCw,
  ArrowLeft,
  SlidersHorizontal,
  ZoomIn,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { getStoredVehicles } from "@/lib/storage/user-data";
import { Vehicle } from "@/types/automotive";
import { findOemCarSpec } from "@/lib/constants/oemSpecs";

// Viewport types
type ViewportType = "engine" | "undercarriage" | "chassis" | "cockpit";

interface ComponentHotspot {
  id: string;
  name: string;
  localName: string;
  category: "Pelumasan" | "Pengereman" | "Pendingin" | "Pengapian" | "Kemudi & Kaki" | "Kelistrikan" | "Struktur Sasis";
  view: ViewportType;
  x: number; // Percentage 0 - 100 on real image
  y: number; // Percentage 0 - 100 on real image
  urgency: "NORMAL" | "PERIKSA" | "KRITIS";
  functionSummary: string;
  wearSymptoms: string[];
  checkInterval: string;
  estimatedCostOem: string;
  estimatedCostAftermarket: string;
  laborCost: string;
  safetyGuide: string;
  torqAiPrompt: string;
  sparePartSearch: string;
}

// REAL PHOTOGRAPHIC VEHICLE COMPONENTS DATABASE
const REAL_VEHICLE_COMPONENTS: ComponentHotspot[] = [
  // ================= 1. RUANG MESIN (ENGINE BAY) =================
  {
    id: "radiator-cap",
    name: "Tutup Radiator (Radiator Relief Cap)",
    localName: "Tutup Radiator Valve 0.9 / 1.1 Bar",
    category: "Pendingin",
    view: "engine",
    x: 31,
    y: 69,
    urgency: "KRITIS",
    functionSummary:
      "Tutup logam berpegas presisi di selang utama radiator. Mengatur tekanan cairan pendingin (0.9 atau 1.1 Bar) agar titik didih coolant naik hingga 120°C tanpa mendidih, serta mengalirkan ekspansi cairan ke tabung cadangan saat panas.",
    wearSymptoms: [
      "Karet seal bawah getas, pecah, atau pegas penekan mulai lembek",
      "Air radiator meluap keluar dari leher radiator atau tabung cadangan tumpah",
      "Suhu mesin cepat naik (overheat) karena tekanan sistem pendingin bocor",
    ],
    checkInterval: "Periksa tiap 10.000 KM, Ganti tiap 40.000 KM / 2 Tahun",
    estimatedCostOem: "Rp 85.000 - Rp 150.000",
    estimatedCostAftermarket: "Rp 45.000 - Rp 70.000",
    laborCost: "Rp 0 (Pasang mandiri)",
    safetyGuide:
      "DILARANG MEMBUKA SAAT MESIN PANAS! Air mendidih bertekanan tinggi akan menyembur keluar seketika dan dapat menyebabkan luka bakar serius.",
    torqAiPrompt:
      "Tolong jelaskan ciri-ciri tutup radiator mobil yang sudah rusak dan bahayanya bagi mesin?",
    sparePartSearch: "Tutup Radiator 0.9 1.1",
  },
  {
    id: "oil-dipstick",
    name: "Dipstick Pengecekan Oli Mesin",
    localName: "Stik Pengukur Oli Mesin (Gagang Kuning)",
    category: "Pelumasan",
    view: "engine",
    x: 31,
    y: 52,
    urgency: "KRITIS",
    functionSummary:
      "Batang ukur logam dengan gagang tarik kuning di sisi blok mesin. Berfungsi untuk memeriksa volume ketinggian oli (antara titik F dan L) serta mengamati degradasi warna atau kontaminasi cairan oli.",
    wearSymptoms: [
      "Ketinggian oli berada di bawah titik 'L' (oli berkurang/bocor)",
      "Warna oli cokelat susu (tercampur coolant radiator akibat gasket silinder jebol)",
      "Keluar asap putih pekat dari lubang dipstick saat mesin hidup (ring piston aus / blow-by gas)",
    ],
    checkInterval: "Pengecekan mandiri tiap 1.000 KM atau 2 minggu sekali",
    estimatedCostOem: "Rp 50.000 - Rp 95.000",
    estimatedCostAftermarket: "Rp 25.000 - Rp 45.000",
    laborCost: "Rp 0",
    safetyGuide:
      "Cek oli saat mesin mati di permukaan tanah yang rata. Tarik dipstick, seka bersih dengan kain/tisu, tancapkan kembali hingga mentok, lalu tarik kembali untuk membaca batas oli.",
    torqAiPrompt:
      "Bagaimana cara membaca dipstick oli mobil yang benar dan apa arti warna oli kecokelatan seperti kopi susu?",
    sparePartSearch: "Dipstick Oli Mesin",
  },
  {
    id: "oil-fill-cap",
    name: "Tutup Pengisian Oli Mesin (Oil Filler Cap)",
    localName: "Tutup Oli Atas Cover Valve",
    category: "Pelumasan",
    view: "engine",
    x: 48,
    y: 54,
    urgency: "NORMAL",
    functionSummary:
      "Tutup putar ulir plastik di atas penutup kepala silinder (valve cover). Lubang utama untuk menuangkan oli mesin baru saat penggantian pelumas rutin.",
    wearSymptoms: [
      "Karet O-ring seal tutup mengeras sehingga ada rembesan oli basah di sekeliling tutup",
      "Terdapat kerak putih atau lumpur oli (sludge) di bagian balik tutup",
    ],
    checkInterval: "Periksa karet seal tiap servis ganti oli",
    estimatedCostOem: "Rp 40.000 - Rp 85.000",
    estimatedCostAftermarket: "Rp 20.000 - Rp 40.000",
    laborCost: "Rp 0",
    safetyGuide:
      "Pastikan tutup terpasang rapat dan terkunci kuat setelah mengisi oli agar tidak terlepas saat mesin bergetar.",
    torqAiPrompt:
      "Mengapa ada kerak putih atau rembesan oli di sekitar tutup pengisian oli mesin mobil?",
    sparePartSearch: "Tutup Oli Mesin Oil Cap",
  },
  {
    id: "alternator",
    name: "Alternator & Puli Drive Belt",
    localName: "Dinamo Ampere / Dinamo Cas",
    category: "Kelistrikan",
    view: "engine",
    x: 58,
    y: 66,
    urgency: "KRITIS",
    functionSummary:
      "Pembangkit daya listrik utama kendaraan saat mesin berputar. Memutar rotor elektromagnetik melalui puli v-belt untuk menyuplai seluruh kelistrikan mobil dan mengisi ulang aki 12V.",
    wearSymptoms: [
      "Indikator lampu aki menyala di speedometer saat mobil sedang melaju",
      "Bunyi mendengung kasar dari bearing alternator yang aus",
      "Tegangan pengisian di bawah 13.5V atau overcharge di atas 15.0V",
    ],
    checkInterval: "Periksa tegangan & ketegangan tali kipas (v-belt) tiap 20.000 KM",
    estimatedCostOem: "Rp 1.400.000 - Rp 2.800.000",
    estimatedCostAftermarket: "Rp 750.000 - Rp 1.200.000",
    laborCost: "Rp 150.000",
    safetyGuide:
      "Lepaskan kabel terminal negatif aki terlebih dahulu sebelum memeriksa atau mengganti dinamo ampere untuk menghindari korsleting.",
    torqAiPrompt:
      "Tanda-tanda dinamo ampere / alternator mobil rusak dan berapa voltase normal pengisian aki?",
    sparePartSearch: "Alternator Dinamo Ampere",
  },
  {
    id: "battery-12v",
    name: "Aki Kendaraan 12V (Car Battery)",
    localName: "Aki Mobil 12V (Basah / Kering)",
    category: "Kelistrikan",
    view: "engine",
    x: 83,
    y: 84,
    urgency: "PERIKSA",
    functionSummary:
      "Penyimpan energi listrik utama untuk memutar dinamo starter mesin mobil dan menyuplai sistem elektronik saat mesin mati.",
    wearSymptoms: [
      "Starter terasa berat atau hanya terdengar bunyi 'cetek-cetek'",
      "Kutub terminal aki berkerak putih atau biru kehijauan (jamur sulfatasi)",
      "Voltase drop di bawah 12.2V saat mesin mati",
    ],
    checkInterval: "Periksa tegangan tiap bulan. Umur pakai aki 1.5 - 2.5 tahun",
    estimatedCostOem: "Rp 750.000 - Rp 1.300.000 (GS Astra / Incoe)",
    estimatedCostAftermarket: "Rp 600.000 - Rp 750.000",
    laborCost: "Gratis pasang di toko aki",
    safetyGuide:
      "Jaga kutub aki tetap bersih. Jangan menyentuh kedua kutub positif dan negatif secara bersamaan dengan kunci besi.",
    torqAiPrompt:
      "Berapa voltase normal aki mobil saat mesin mati dan saat mesin hidup?",
    sparePartSearch: "Aki Mobil 12V 35Ah 45Ah",
  },
  {
    id: "air-intake-box",
    name: "Box Filter Udara & Belalai Intake",
    localName: "Kotak Saringan Udara Mesin",
    category: "Pengapian",
    view: "engine",
    x: 25,
    y: 41,
    urgency: "NORMAL",
    functionSummary:
      "Menyaring debu, pasir, dan kotoran dari udara luar sebelum dialirkan ke throttle body dan ruang bakar mesin silinder.",
    wearSymptoms: [
      "Elemen kertas filter udara tampak kotor hitam berdebu pekat",
      "Tarikan mobil terasa berat / 'ngempos' dan konsumsi bensin boros",
    ],
    checkInterval: "Bersihkan tiap 10.000 KM, Ganti tiap 20.000 - 30.000 KM",
    estimatedCostOem: "Rp 120.000 - Rp 250.000",
    estimatedCostAftermarket: "Rp 45.000 - Rp 80.000",
    laborCost: "Rp 0",
    safetyGuide:
      "Jangan mencuci filter kertas dengan bensin atau air bertekanan karena serat penyaringnya akan rusak.",
    torqAiPrompt:
      "Kapan filter udara mobil harus diganti dan apa dampaknya jika dibiarkan kotor?",
    sparePartSearch: "Filter Udara Mesin",
  },
  {
    id: "brake-master",
    name: "Brake Master Cylinder & Boster Rem",
    localName: "Master Rem Atas & Tabung Minyak Rem",
    category: "Pengereman",
    view: "engine",
    x: 77,
    y: 52,
    urgency: "KRITIS",
    functionSummary:
      "Mengonversi injakan pedal rem menjadi tekanan hidrolik berkekuatan tinggi menuju keempat roda melalui bantuan vakum boster bulat hitam di belakangnya.",
    wearSymptoms: [
      "Pedal rem terasa amblas perlahan ke bawah saat ditahan di lampu merah",
      "Minyak rem di tabung reservoir berkurang atau warnanya sudah keruh gelap",
      "Ada rembesan minyak rem basah di sambungan boster rem",
    ],
    checkInterval: "Kuras minyak rem tiap 40.000 KM atau 2 tahun",
    estimatedCostOem: "Rp 450.000 - Rp 1.100.000",
    estimatedCostAftermarket: "Rp 250.000 - Rp 450.000",
    laborCost: "Rp 150.000",
    safetyGuide:
      "Minyak rem dapat merusak cat mobil jika terciprat. Segera bilas dengan air bersih mengalir jika terkena cat bodi.",
    torqAiPrompt:
      "Penyebab pedal rem mobil amblas saat diinjak lama dan cara cek kebocoran master rem atas?",
    sparePartSearch: "Brake Master Cylinder Rem Atas",
  },
  {
    id: "spark-plug-coils",
    name: "Kabel Busi & Koil Pengapian",
    localName: "Kabel Busi / Koil Pengapian Silinder",
    category: "Pengapian",
    view: "engine",
    x: 43,
    y: 49,
    urgency: "PERIKSA",
    functionSummary:
      "Menyalurkan arus listrik tegangan tinggi (20.000V+) menuju busi di dalam kepala silinder untuk meledakkan bensin.",
    wearSymptoms: [
      "Mesin terasa pincang dan bergetar hebat saat akselerasi",
      "Mobil tersendat-sendat (misfire) saat pedal gas ditekan",
    ],
    checkInterval: "Busi: Tiap 20.000 KM (Nikel) / 80.000 KM (Iridium). Kabel busi: 60.000 KM",
    estimatedCostOem: "Busi: Rp 35.000 - Rp 150.000/pc | Kabel: Rp 150.000 - Rp 350.000",
    estimatedCostAftermarket: "Rp 25.000 - Rp 80.000/pc",
    laborCost: "Rp 50.000",
    safetyGuide:
      "Jangan memegang kabel busi saat mesin sedang menyala untuk menghindari sengatan listrik tegangan tinggi.",
    torqAiPrompt:
      "Tanda mesin mobil pincang karena busi mati atau kabel koil bocor?",
    sparePartSearch: "Busi Mobil Kabel Busi",
  },

  // ================= 2. KAKI-KAKI & KOLONG (UNDERCARRIAGE) =================
  {
    id: "brake-rotor-caliper",
    name: "Piringan Cakram & Kaliper Rem Roda Depan",
    localName: "Piringan Cakram Rem & Kaliper Depan",
    category: "Pengereman",
    view: "undercarriage",
    x: 25,
    y: 51,
    urgency: "KRITIS",
    functionSummary:
      "Cakram rotor baja yang berputar bersama roda, dijepit oleh kampas rem hidrolik di kaliper untuk menghasilkan daya cengkeram pengereman aman.",
    wearSymptoms: [
      "Bunyi mendecit tajam saat rem diinjak (plat indikator kampas habis)",
      "Setir atau pedal bergetar saat pengereman di kecepatan 80 km/jam (cakram peang)",
      "Kampas rem tipis tersisa di bawah 3 mm",
    ],
    checkInterval: "Periksa ketebalan tiap 10.000 KM, Ganti kampas 25.000 - 40.000 KM",
    estimatedCostOem: "Kampas: Rp 350.000 - Rp 700.000 | Cakram: Rp 450.000 - Rp 950.000",
    estimatedCostAftermarket: "Kampas: Rp 150.000 - Rp 300.000 (Bendix / MK)",
    laborCost: "Rp 75.000 - Rp 100.000",
    safetyGuide:
      "Jangan menyiram air dingin ke velg/cakram yang baru saja panas karena dapat menyebabkan cakram retak atau melengkung.",
    torqAiPrompt:
      "Kenapa rem mobil bunyi mendecit dan pedal bergetar saat diinjak?",
    sparePartSearch: "Kampas Rem Depan Cakram Rem",
  },
  {
    id: "strut-shock",
    name: "Shock Absorber Strut & Per Spiral",
    localName: "Sokbreker / Shockbreaker Depan",
    category: "Kemudi & Kaki",
    view: "undercarriage",
    x: 43,
    y: 19,
    urgency: "PERIKSA",
    functionSummary:
      "Meredam gaya pantul dan kejutan jalan agar bodi mobil tidak mengayun liar, menjaga ban tetap menempel stabil di aspal jalan.",
    wearSymptoms: [
      "Batang silinder shockbreaker basah oleh rembesan oli hidrolik",
      "Mobil mengayun berlebih (bouncing) setelah melewati polisi tidur",
      "Bodi mobil limbung saat berbelok di tikungan tajam",
    ],
    checkInterval: "Periksa fisik tiap 20.000 KM, Umur pakai rata-rata 60.000 - 80.000 KM",
    estimatedCostOem: "Rp 850.000 - Rp 1.800.000 / pasang",
    estimatedCostAftermarket: "Rp 600.000 - Rp 1.100.000 / pasang (Kayaba)",
    laborCost: "Rp 150.000",
    safetyGuide:
      "Penggantian per spiral wajib menggunakan treker per khusus untuk mencegah pegas melesat lepas.",
    torqAiPrompt:
      "Cara mengetahui shockbreaker mobil sudah mati atau bocor oli?",
    sparePartSearch: "Shockbreaker Depan Kayaba",
  },
  {
    id: "tie-rod",
    name: "Tie Rod End (Ujung Terot Kemudi)",
    localName: "Terot Kemudi Knuckle Roda",
    category: "Kemudi & Kaki",
    view: "undercarriage",
    x: 34,
    y: 50,
    urgency: "KRITIS",
    functionSummary:
      "Sendi engsel peluru yang menghubungkan batang kemudi rack steer ke knuckle roda depan untuk membelokkan roda sesuai putaran setir.",
    wearSymptoms: [
      "Bunyi 'klotok-klotok' saat melewati jalan bergelombang / jalan rusak",
      "Setir terasa goyang / oblak (ada jeda speleng) atau menarik ke satu sisi",
      "Telapak ban botak sebelah (makan ban bagian dalam)",
    ],
    checkInterval: "Periksa kelonggaran sendi tiap 20.000 KM atau saat spooring",
    estimatedCostOem: "Rp 350.000 - Rp 650.000 / pasang",
    estimatedCostAftermarket: "Rp 180.000 - Rp 300.000 / pasang (555 Japan)",
    laborCost: "Rp 100.000 + Biaya Spooring Rp 150.000",
    safetyGuide:
      "Jika tie rod putus saat berjalan kencang, roda depan akan terlipat dan mobil kehilangan kendali kemudi seketika!",
    torqAiPrompt:
      "Apa beda bunyi kerusakan tie rod dengan rack steer mobil?",
    sparePartSearch: "Tie Rod End Terot Depan",
  },
  {
    id: "ball-joint",
    name: "Lower Ball Joint Sayap Bawah",
    localName: "Baljoin / Ball Joint Sayap Bawah",
    category: "Kemudi & Kaki",
    view: "undercarriage",
    x: 33,
    y: 69,
    urgency: "KRITIS",
    functionSummary:
      "Pusat engsel tumpuan utama roda depan pada sayap bawah (lower control arm), menopang beban bodi sekaligus memungkinkan roda berbelok dan naik-turun.",
    wearSymptoms: [
      "Bunyi derit besi tajam atau bunyi gluduk saat melewati lubang jalan",
      "Karet penutup gemuk (boot) robek dan pelumas gemuk kering",
      "Roda goyang saat digerakkan arah vertikal (jam 12-6) di atas dongkrak",
    ],
    checkInterval: "Periksa tiap 20.000 KM",
    estimatedCostOem: "Rp 250.000 - Rp 550.000 / pc",
    estimatedCostAftermarket: "Rp 120.000 - Rp 250.000 / pc",
    laborCost: "Rp 100.000",
    safetyGuide:
      "Ball joint yang copot akan membuat roda lepas dari dudukan sasis dan mobil terjerembap ke aspal!",
    torqAiPrompt:
      "Cara cek ball joint mobil yang sudah oblak menggunakan dongkrak roda?",
    sparePartSearch: "Ball Joint Sayap Bawah",
  },
  {
    id: "rack-steer-boot",
    name: "Karet Boot Rack Steer & Rumah Stir",
    localName: "Karet Koker Rack Steer / Rumah Stir",
    category: "Kemudi & Kaki",
    view: "undercarriage",
    x: 62,
    y: 44,
    urgency: "PERIKSA",
    functionSummary:
      "Karet elastis bergelombang penutup as gir rack steer. Mencegah air, kotoran, dan pasir masuk yang dapat mengikis as gir kemudi hingga berkarat.",
    wearSymptoms: [
      "Karet boot robek atau terlepas klem penjepitnya",
      "Setir terasa berat atau timbul bunyi gerusan kasar di bawah dashboard",
    ],
    checkInterval: "Periksa fisik tiap servis ganti oli / cuci kolong",
    estimatedCostOem: "Rp 90.000 - Rp 180.000 / pc",
    estimatedCostAftermarket: "Rp 40.000 - Rp 75.000 (Seiken)",
    laborCost: "Rp 75.000",
    safetyGuide:
      "Segera ganti karet boot yang sobek untuk mencegah air merusak as rack steer yang biaya gantinya mencapai jutaan rupiah.",
    torqAiPrompt:
      "Kenapa karet boot rack steer robek harus cepat diganti?",
    sparePartSearch: "Boot Rack Steer Karet Rumah Stir",
  },
  {
    id: "cv-joint-boot",
    name: "Karet Boot As Roda (Drive Shaft CV Joint)",
    localName: "Karet Koker As Roda Depan",
    category: "Kemudi & Kaki",
    view: "undercarriage",
    x: 40,
    y: 54,
    urgency: "PERIKSA",
    functionSummary:
      "Karet pelindung pelumas gemuk moly pada as roda penggerak (Constant Velocity Joint) yang meneruskan tenaga transmisi ke roda depan.",
    wearSymptoms: [
      "Gemuk hitam kental terciprat di velg dalam atau spakbor",
      "Bunyi 'tek-tek-tek' berirama saat mobil belok patah sambil maju",
    ],
    checkInterval: "Periksa fisik tiap ganti oli",
    estimatedCostOem: "Karet Boot: Rp 80.000 - Rp 150.000 | 1 Set As Roda: Rp 900.000 - Rp 2.200.000",
    estimatedCostAftermarket: "Rp 45.000 - Rp 70.000",
    laborCost: "Rp 100.000",
    safetyGuide:
      "Jika dibiarkan robek, as roda akan macet atau rontok saat berbelok.",
    torqAiPrompt:
      "Kenapa mobil bunyi tek-tek saat belok patah dan cara cek boot as roda robek?",
    sparePartSearch: "Karet Boot As Roda CV Joint",
  },
  {
    id: "engine-oil-pan",
    name: "Karter / Bak Penampung Oli Mesin (Oil Pan)",
    localName: "Karter Oli Mesin Bawah",
    category: "Pelumasan",
    view: "undercarriage",
    x: 84,
    y: 39,
    urgency: "PERIKSA",
    functionSummary:
      "Bak wadah logam di dasar mesin tempat oli mengendap sebelum disedot pompa oli. Memiliki baut pembuangan oli (drain plug) untuk menguras oli saat servis berkala.",
    wearSymptoms: [
      "Rembesan oli basah di garis sambungan lem packing lem karter",
      "Tetesan oli menetes di lantai garasi saat mobil diparkir semalaman",
      "Bak karter penyok akibat benturan polisi tidur tinggi",
    ],
    checkInterval: "Inspeksi visual tiap servis ganti oli",
    estimatedCostOem: "Lem Sealant Packing: Rp 80.000 | Gasket: Rp 75.000 - Rp 150.000",
    estimatedCostAftermarket: "Rp 40.000 - Rp 75.000",
    laborCost: "Rp 150.000 (Pembersihan & Lem ulang karter)",
    safetyGuide:
      "Pastikan baut pembuangan oli dipasang dengan ring/washer baru dan tidak dikencangkan secara berlebihan agar drat tidak slek.",
    torqAiPrompt:
      "Bagaimana mengatasi karter oli mesin mobil yang rembes tanpa harus ganti bak karter baru?",
    sparePartSearch: "Gasket Karter Oli Mesin Lem Silikon",
  },

  // ================= 3. SASIS & RANGKA (CHASSIS & STRUCTURAL) =================
  {
    id: "apron-crossmember",
    name: "Apron Depan (Radiator Apron Crossmember)",
    localName: "Apron Depan / Dudukan Radiator / Tulang Bulu Ayam",
    category: "Struktur Sasis",
    view: "chassis",
    x: 18,
    y: 65,
    urgency: "KRITIS",
    functionSummary:
      "Pelat baja melintang di bagian paling depan sasis mobil. Menopang radiator, kondensor AC, lampu depan, dan menjadi zona peredam pertama benturan frontal (crumple zone).",
    wearSymptoms: [
      "Jejak dempul tebal, bekas ketokan las kasar, atau lipatan pelat besi yang tidak simetris",
      "Baut penyangga radiator cacat bekas dibuka paksa",
      "Celah antara kap mesin dengan lampu kiri dan kanan tidak rapat merata",
    ],
    checkInterval: "Wajib diinspeksi saat membeli mobil bekas",
    estimatedCostOem: "Sasis bekas tabrak depan mengurangi harga jual hingga 30-40%",
    estimatedCostAftermarket: "Biaya Tarik Sasis: Rp 800.000 - Rp 2.500.000",
    laborCost: "-",
    safetyGuide:
      "Apron depan yang pernah patah atau disambung las sudah kehilangan kekuatan baja aslinya dalam melindungi penumpang saat terjadi benturan berikutnya.",
    torqAiPrompt:
      "Bagaimana cara membedakan apron depan mobil yang masih orisinil dengan yang bekas tabrakan?",
    sparePartSearch: "Apron Depan Mobil",
  },
  {
    id: "chassis-rails",
    name: "Tulang Sasis Utama Depan (Longitudinal Frame Rails)",
    localName: "Tulang Sasis Depan (Kiri & Kanan)",
    category: "Struktur Sasis",
    view: "chassis",
    x: 18,
    y: 46,
    urgency: "KRITIS",
    functionSummary:
      "Dua balok baja utama yang membujur di kedua sisi ruang mesin. Menopang dudukan mesin (engine mounting) dan suspensi depan.",
    wearSymptoms: [
      "Batang sasis bergelombang atau ada bekas sambungan las potong",
      "Jejak bekas tarikan rantai alat tarik sasis (dozer frame)",
      "Karat keropos yang menggerogoti ketebalan pelat baja",
    ],
    checkInterval: "Wajib diinspeksi saat membeli mobil bekas",
    estimatedCostOem: "Pilar penopang sasis utama tidak disarankan diperbaiki sambung",
    estimatedCostAftermarket: "-",
    laborCost: "-",
    safetyGuide:
      "Hindari mobil yang sasisnya sudah pernah dipotong sambung, karena geometri kelurusan mobil tidak akan pernah stabil kembali di kecepatan tinggi.",
    torqAiPrompt:
      "Apa risiko membeli mobil bekas yang tulangnya pernah bengkok atau kena sasis?",
    sparePartSearch: "Inspeksi Sasis Mobil Bekas",
  },
  {
    id: "trunk-floor-tub",
    name: "Lantai Bagasi Belakang & Bak Ban Serep",
    localName: "Kolong Lantai Bagasi / Rumah Ban Serep",
    category: "Struktur Sasis",
    view: "chassis",
    x: 80,
    y: 29,
    urgency: "KRITIS",
    functionSummary:
      "Pelat lantai bagian belakang tempat meletakkan ban cadangan. Merupakan lokasi paling akurat untuk mengecek apakah mobil pernah mengalami benturan tabrak dari belakang.",
    wearSymptoms: [
      "Garis sealer pabrik hilang atau diganti dengan lem silikon biasa",
      "Pelat dasar bak ban serep tampak berkerut, penyok, atau berkarat",
      "Karet list bagasi sudah pernah dilepas ganti",
    ],
    checkInterval: "Wajib diinspeksi saat membeli mobil bekas",
    estimatedCostOem: "Perbaikan body repair lantai belakang: Rp 1.000.000 - Rp 3.000.000",
    estimatedCostAftermarket: "-",
    laborCost: "-",
    safetyGuide:
      "Buka karpet bagasi dan angkat ban serep sepenuhnya untuk melihat langsung pelat dasar logam dan jejak sealer pabrik.",
    torqAiPrompt:
      "Bagaimana cara mengecek bekas tabrak belakang mobil lewat lantai ban serep bagasi?",
    sparePartSearch: "Karet List Bagasi Belakang",
  },
  {
    id: "cabin-pillars",
    name: "Struktur Pilar Kabin (A, B, C-Pillar)",
    localName: "Pilar A, B, C & Tulang Pintu Kabin",
    category: "Struktur Sasis",
    view: "chassis",
    x: 48,
    y: 22,
    urgency: "KRITIS",
    functionSummary:
      "Tiang baja penyangga atap dan kaca mobil. Melindungi keselamatan kabin penumpang dari risiko terguling (rollover) atau benturan dari sisi samping (side impact).",
    wearSymptoms: [
      "Jejak las titik pabrik (spot welding) di balik karet balon pintu hilang atau tertutup dempul tebal",
      "Pintu mobil sulit ditutup rapat atau celah pintu tidak sejajar",
    ],
    checkInterval: "Inspeksi saat beli mobil bekas",
    estimatedCostOem: "Struktur pilar kabin tidak boleh cacat",
    estimatedCostAftermarket: "-",
    laborCost: "-",
    safetyGuide:
      "Tarik karet list pintu bagian atas sedikit untuk melihat barisan titik las pabrik (spot weld) yang bulat rapi.",
    torqAiPrompt:
      "Cara cek titik las pabrik (spot welding) di pilar pintu mobil bekas?",
    sparePartSearch: "Karet Balon Pintu Mobil",
  },

  // ================= 4. KABIN & KELISTRIKAN (COCKPIT & ELECTRICAL) =================
  {
    id: "obd2-port",
    name: "Port Diagnostik OBD-II (16-Pin Scanner Port)",
    localName: "Soket Scanner OBD-2 (Bawah Kolom Setir)",
    category: "Kelistrikan",
    view: "cockpit",
    x: 42,
    y: 70,
    urgency: "NORMAL",
    functionSummary:
      "Soket standar 16-pin di bawah kolom kemudi untuk menghubungkan alat scanner diagnostik mekanik dengan komputer ECU mobil guna mendeteksi kode kerusakan (DTC) mesin dan sensor.",
    wearSymptoms: [
      "Lampu Check Engine (MIL) menyala di panel speedometer",
      "Scanner tidak bisa membaca data (pin soket longgar atau sekring OBD putus)",
    ],
    checkInterval: "Pindai tiap servis berkala atau saat lampu indikator menyala",
    estimatedCostOem: "Alat Scanner ELM327 Bluetooth: Rp 45.000 - Rp 150.000",
    estimatedCostAftermarket: "Jasa Scan Bengkel: Rp 50.000 - Rp 150.000",
    laborCost: "-",
    safetyGuide:
      "Pastikan kontak mobil dalam posisi OFF saat mencolokkan atau mencabut soket scanner untuk mencegah lonjakan listrik.",
    torqAiPrompt:
      "Bagaimana cara scan mobil sendiri menggunakan alat scanner OBD-2 dan aplikasi smartphone?",
    sparePartSearch: "Scanner OBD2 Bluetooth ELM327",
  },
  {
    id: "fuse-box-cockpit",
    name: "Kotak Sekring Kabin & Relay (Interior Fuse Box)",
    localName: "Rumah Sekring Kabin (Bawah Dashboard)",
    category: "Kelistrikan",
    view: "cockpit",
    x: 24,
    y: 72,
    urgency: "PERIKSA",
    functionSummary:
      "Panel pusat pengaman arus listrik untuk lampu, klakson, wiper, power window, AC, dan aksesoris interior agar terhindar dari bahaya korsleting atau arus berlebih.",
    wearSymptoms: [
      "Fungsi kelistrikan tertentu mati mendadak (misal: klakson atau pemantik api)",
      "Sekring blade terbakar atau kawatnya putus",
      "Rumah sekring meleleh akibat pemakaian sekring berukuran terlalu besar",
    ],
    checkInterval: "Periksa cadangan sekring tiap 6 bulan",
    estimatedCostOem: "Sekring Blade OEM: Rp 5.000 - Rp 15.000/pc",
    estimatedCostAftermarket: "1 Set Sekring: Rp 20.000 (Isi 10)",
    laborCost: "Rp 0 (Bisa ganti sendiri)",
    safetyGuide:
      "DILARANG MENGGANTI SEKRING DENGAN AMPERE LEBIH TINGGI ATAU MEMBALUT DENGAN KAWAT TEMBAGA! Ini penyebab utama mobil terbakar.",
    torqAiPrompt:
      "Apa bahaya mengganti sekring mobil dengan ampere lebih besar atau melilitnya dengan kawat kabel?",
    sparePartSearch: "Sekring Mobil Blade Fuse",
  },
];

function ArInspectorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedVehicleId = searchParams.get("vehicleId");

  const { user } = useAuth();
  const userKey = user?.email || "default_user";

  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeView, setActiveView] = useState<ViewportType>("engine");
  const [activeComponentId, setActiveComponentId] = useState<string>("radiator-cap");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [hudActiveTab, setHudActiveTab] = useState<"FUNGSI" | "GEJALA" | "DIY">("FUNGSI");
  const [showPins, setShowPins] = useState(true);

  // Load vehicles from localStorage
  useEffect(() => {
    const loaded = getStoredVehicles(userKey);
    setVehicles(loaded);

    if (loaded.length > 0) {
      if (requestedVehicleId) {
        const found = loaded.find((v) => v.id === requestedVehicleId);
        if (found) {
          setSelectedVehicle(found);
          return;
        }
      }
      setSelectedVehicle(loaded[0]);
    }
  }, [userKey, requestedVehicleId]);

  // Filter components by active view and search query
  const viewComponents = useMemo(() => {
    return REAL_VEHICLE_COMPONENTS.filter((c) => {
      const matchView = c.view === activeView;
      const matchQuery =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.localName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.functionSummary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchView && matchQuery;
    });
  }, [activeView, searchQuery]);

  // Current active component
  const currentComponent = useMemo(() => {
    return (
      REAL_VEHICLE_COMPONENTS.find((c) => c.id === activeComponentId) ||
      viewComponents[0] ||
      REAL_VEHICLE_COMPONENTS[0]
    );
  }, [activeComponentId, viewComponents]);

  // Switch component
  const handleSelectComponent = (comp: ComponentHotspot) => {
    setActiveView(comp.view);
    setActiveComponentId(comp.id);
  };

  // Real Image Map for each Viewport
  const viewportImageSrc = useMemo(() => {
    switch (activeView) {
      case "engine":
        return "/car-views/engine_bay_real.jpg";
      case "undercarriage":
        return "/car-views/undercarriage_real.jpg";
      case "chassis":
        return "/car-views/chassis_real.jpg";
      case "cockpit":
        return "/car-views/cockpit_real.jpg";
      default:
        return "/car-views/engine_bay_real.jpg";
    }
  }, [activeView]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Navigation back to Garage & Active Car Identity */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/garage"
            className="h-10 w-10 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shadow-2xs"
            title="Kembali ke Garasi Mobil"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                Visual AR Terintegrasi Garasi
              </span>
              {selectedVehicle && (
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  Plat: {selectedVehicle.licensePlate || "Tanpa Plat"}
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {selectedVehicle
                ? `Eksplorasi Fisik: ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})`
                : "Eksplorasi Fisik Komponen Mobil"}
            </h1>
          </div>
        </div>

        {/* Vehicle Switcher if user has multiple cars in garage */}
        {vehicles.length > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Ganti Unit:</span>
            <select
              aria-label="Pilih Mobil Terdaftar"
              value={selectedVehicle?.id || ""}
              onChange={(e) => {
                const found = vehicles.find((v) => v.id === e.target.value);
                if (found) setSelectedVehicle(found);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.year}) - {v.licensePlate || "Plat -"}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Viewport Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* 4 Viewport Angles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          {[
            { id: "engine", label: "Ruang Mesin", icon: Cpu, count: 8 },
            { id: "undercarriage", label: "Kaki-Kaki & Kolong", icon: Activity, count: 7 },
            { id: "chassis", label: "Sasis & Rangka", icon: Layers, count: 4 },
            { id: "cockpit", label: "Kabin & Kelistrikan", icon: Zap, count: 2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveView(tab.id as ViewportType);
                  const firstOfView = REAL_VEHICLE_COMPONENTS.find((c) => c.view === tab.id);
                  if (firstOfView) setActiveComponentId(firstOfView.id);
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Pin Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari part: busi, terot, rem, aki..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowPins(!showPins)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 shrink-0 ${
              showPins
                ? "bg-sky-50 dark:bg-sky-950/60 border-sky-300 text-sky-700 dark:text-sky-300"
                : "bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-500"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pin AR:</span>
            <span>{showPins ? "Aktif" : "Sembunyi"}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: Left Photographic Canvas, Right Intelligence Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT: REAL VEHICLE PHOTOGRAPHIC CANVAS (7 COLS) ================= */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col select-none">
            {/* Top Telemetry Overlay */}
            <div className="relative z-20 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white uppercase tracking-wider">
                  VISUAL ASLI: {activeView.toUpperCase()}
                </span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-slate-400 hidden sm:inline">
                  {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : "OEM Unit"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Crosshair className="h-3.5 w-3.5" />
                <span>TARGET: {currentComponent?.name.split(" ")[0]}</span>
              </div>
            </div>

            {/* Central Real Photographic Image Stage */}
            <div className="relative w-full aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
              {/* REAL AUTHENTIC AUTOMOTIVE PHOTOGRAPH */}
              <Image
                src={viewportImageSrc}
                alt={activeView}
                fill
                priority
                unoptimized
                className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              />

              {/* Subtle AR Grid & Vignette Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
                  backgroundSize: "36px 36px",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* ================= AR HOTSPOTS & LEADER LINES SUPERIMPOSED ON REAL PHOTO ================= */}
              {showPins &&
                viewComponents.map((hotspot, idx) => {
                  const isSelected = hotspot.id === activeComponentId;
                  const isHovered = hotspot.id === hoveredHotspotId;

                  const pinColor =
                    hotspot.urgency === "KRITIS"
                      ? "bg-rose-600 text-white ring-rose-400/50 shadow-rose-600/50"
                      : hotspot.urgency === "PERIKSA"
                      ? "bg-amber-500 text-slate-950 ring-amber-400/50 shadow-amber-500/50"
                      : "bg-emerald-600 text-white ring-emerald-400/50 shadow-emerald-600/50";

                  return (
                    <div
                      key={hotspot.id}
                      style={{
                        position: "absolute",
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="group z-30"
                    >
                      {/* Concentric AR Radar Wave Ring on active/hover */}
                      {(isSelected || isHovered) && (
                        <>
                          <div className="absolute -inset-4 rounded-full border border-sky-400/80 animate-ping pointer-events-none" />
                          <div className="absolute -inset-2 rounded-full border border-white/60 pointer-events-none" />
                        </>
                      )}

                      {/* Interactive Target Reticle Button */}
                      <button
                        type="button"
                        onClick={() => setActiveComponentId(hotspot.id)}
                        onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                        onMouseLeave={() => setHoveredHotspotId(null)}
                        className={`relative h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center font-mono font-black text-xs transition-all duration-200 cursor-pointer shadow-xl ring-4 active:scale-90 ${
                          isSelected
                            ? "bg-sky-400 text-slate-950 scale-125 ring-white shadow-sky-400/80"
                            : isHovered
                            ? "bg-white text-slate-900 scale-110 ring-sky-400"
                            : pinColor
                        }`}
                        title={`${hotspot.name} (${hotspot.localName})`}
                      >
                        {idx + 1}
                      </button>

                      {/* AR Callout Card with Pointer Leader Tag */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 pointer-events-none whitespace-nowrap px-3 py-1.5 rounded-2xl bg-slate-950/95 text-white border border-sky-500/40 text-[11px] font-bold shadow-2xl backdrop-blur-md transition-all duration-200 ${
                          isSelected || isHovered
                            ? "opacity-100 translate-y-0 scale-100"
                            : "opacity-0 translate-y-2 scale-95"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              hotspot.urgency === "KRITIS"
                                ? "bg-rose-500 animate-ping"
                                : hotspot.urgency === "PERIKSA"
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            }`}
                          />
                          <span className="text-white">{hotspot.name}</span>
                        </div>
                        <span className="block text-[9.5px] text-orange-400 font-semibold mt-0.5">
                          Bengkel: "{hotspot.localName}"
                        </span>
                        {/* Downward triangle pointer */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950/95" />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Bottom Status Bar */}
            <div className="relative z-20 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/90 backdrop-blur-md px-4 py-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-sky-400" />
                <span>
                  TARGET PIN #{viewComponents.findIndex((c) => c.id === currentComponent?.id) + 1}:{" "}
                  <strong className="text-slate-200">{currentComponent?.name}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">KOMPONEN TERDETEKSI: {viewComponents.length}</span>
              </div>
            </div>
          </div>

          {/* Quick List of All Components in Viewport */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Crosshair className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Daftar Komponen Terdeteksi pada Sudut Pandang Ini ({viewComponents.length})</span>
              </span>
              <span className="text-[10px] text-slate-400">Klik nama part untuk mengunci posisi pada foto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {viewComponents.map((item, i) => {
                const isActive = item.id === currentComponent?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectComponent(item)}
                    className={`p-3 rounded-2xl text-left transition-all border flex items-center justify-between gap-2.5 cursor-pointer ${
                      isActive
                        ? "bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-800 text-sky-950 dark:text-sky-200 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs font-black shrink-0 ${
                          isActive
                            ? "bg-sky-500 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="truncate">
                        <span className="block text-xs font-bold truncate text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="block text-[10px] text-blue-600 dark:text-blue-400 truncate">
                          "{item.localName}"
                        </span>
                      </div>
                    </div>

                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        item.urgency === "KRITIS"
                          ? "bg-rose-500"
                          : item.urgency === "PERIKSA"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      title={item.urgency}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: COMPONENT TECHNICAL INTELLIGENCE DRAWER (5 COLS) ================= */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {currentComponent ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {/* Card Header: Title & Badges */}
              <div className="p-5 bg-slate-50/80 dark:bg-slate-800/50 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {currentComponent.category}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      currentComponent.urgency === "KRITIS"
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200"
                        : currentComponent.urgency === "PERIKSA"
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        currentComponent.urgency === "KRITIS"
                          ? "bg-rose-500 animate-ping"
                          : currentComponent.urgency === "PERIKSA"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <span>
                      {currentComponent.urgency === "KRITIS"
                        ? "Prioritas Kritis"
                        : currentComponent.urgency === "PERIKSA"
                        ? "Periksa Berkala"
                        : "Standar Normal"}
                    </span>
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {currentComponent.name}
                  </h2>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                    Istilah Bengkel: "{currentComponent.localName}"
                  </p>
                </div>
              </div>

              {/* Quick Telemetry Metric Bar: Interval & Cost */}
              <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50/40 dark:bg-slate-900 text-xs">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Jadwal Cek / Ganti
                  </span>
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100">
                    {currentComponent.checkInterval}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Estimasi Part OEM
                  </span>
                  <span className="block text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {currentComponent.estimatedCostOem}
                  </span>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="p-4 space-y-3.5">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  {[
                    { id: "FUNGSI", label: "Fungsi Mekanikal", icon: Info },
                    { id: "GEJALA", label: "Gejala Aus/Rusak", icon: AlertTriangle },
                    { id: "DIY", label: "Tips Cek Fisik", icon: Wrench },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isActive = hudActiveTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setHudActiveTab(t.id as any)}
                        className={`flex-1 py-2 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Fungsi Mekanikal */}
                {hudActiveTab === "FUNGSI" && (
                  <div className="space-y-3 text-xs leading-relaxed animate-in fade-in duration-150">
                    <p className="text-slate-700 dark:text-slate-300">
                      {currentComponent.functionSummary}
                    </p>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        Rincian Biaya Penggantian (Estimasi IDR):
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">Part Aftermarket:</span>{" "}
                          <strong className="text-slate-700 dark:text-slate-200 font-mono">
                            {currentComponent.estimatedCostAftermarket}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Ongkos Jasa Pasang:</span>{" "}
                          <strong className="text-slate-700 dark:text-slate-200 font-mono">
                            {currentComponent.laborCost}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Gejala Kerusakan */}
                {hudActiveTab === "GEJALA" && (
                  <div className="space-y-2.5 text-xs animate-in fade-in duration-150">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Ciri & Gejala Kerusakan yang Bisa Dirasakan Pengemudi:
                    </span>
                    <ul className="space-y-2">
                      {currentComponent.wearSymptoms.map((symptom, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-950 dark:text-amber-200"
                        >
                          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <span className="text-[11.5px] leading-relaxed">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tab 3: Panduan Cek Fisik DIY */}
                {hudActiveTab === "DIY" && (
                  <div className="space-y-2.5 text-xs animate-in fade-in duration-150">
                    <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-sky-800 dark:text-sky-300">
                        <ShieldAlert className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        <span>Protokol Keamanan Cek Fisik di Lapangan:</span>
                      </div>
                      <p className="text-[11.5px] leading-relaxed">
                        {currentComponent.safetyGuide}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Ask TORQ AI & Buy Parts */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const carName = selectedVehicle
                      ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})`
                      : "Mobil Saya";
                    const query = encodeURIComponent(
                      `${currentComponent.torqAiPrompt} (Mobil Terdaftar di Garasi: ${carName})`
                    );
                    router.push(`/diagnose?initialQuery=${query}`);
                  }}
                  className="w-full min-h-[46px] rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Tanya TORQ AI tentang Komponen Ini</span>
                </button>

                <Link
                  href={`/spareparts?search=${encodeURIComponent(
                    `${currentComponent.sparePartSearch} ${
                      selectedVehicle ? selectedVehicle.model : ""
                    }`.trim()
                  )}`}
                  className="w-full min-h-[42px] rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all"
                >
                  <ShoppingBag className="h-4 w-4 text-emerald-600" />
                  <span>Cari Suku Cadang Terkait</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <Crosshair className="h-10 w-10 mx-auto text-slate-300 animate-spin mb-3" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                Pilih Titik Komponen pada Foto Mobil
              </p>
              <p className="text-xs mt-1">
                Klik salah satu pin pada foto di sebelah kiri untuk melihat rincian diagnosa teknisnya.
              </p>
            </div>
          )}

          {/* Quick Tip Box */}
          <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-950 dark:text-blue-200 text-xs space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Panduan Visual Fisik Lapangan
            </span>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              Visual di atas menampilkan foto asli ruang mesin, kolong kaki-kaki, dan sasis. Gunakan pin nomor untuk mengidentifikasi komponen fisik mobil Anda di garasi secara langsung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArInspectorPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-400">
          <Crosshair className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-xs font-bold">Memuat Visual AR Komponen Mobil...</p>
        </div>
      }
    >
      <ArInspectorContent />
    </Suspense>
  );
}
