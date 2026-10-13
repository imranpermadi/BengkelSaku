"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Car,
  Wrench,
  Sparkles,
  Info,
  ShieldCheck,
  RotateCcw,
  DollarSign,
  Link as LinkIcon,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Share2,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Pencil,
  Plus,
  Compass,
  Image as ImageIcon,
  Crosshair,
  Eye,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getStoredVehicles,
  getStoredTargetCars,
  saveStoredTargetCar,
  updateStoredTargetCar,
  deleteStoredTargetCar,
  syncTargetCarsWithDatabase,
} from "@/lib/storage/user-data";
import { Vehicle, TargetCar } from "@/types/automotive";
import { InspectionPublicShowcase } from "@/components/showcase/InspectionPublicShowcase";

interface InspectionPoint {
  id: string;
  category: "Mesin" | "Kaki-Kaki" | "Kelistrikan" | "Bodi & Sasis" | "Interior" | "Dokumen";
  name: string;
  guideTip: string;
  status: "OK" | "NG";
  notes: string;
}

interface TargetCarListing {
  id?: string;
  title: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  askingPrice: number;
  askingPriceFormatted: string;
  odometer: number;
  sellerDescription: string;
  sellerClaims: string[];
  imageUrl: string;
  images?: string[];
  sourceUrl?: string;
  sourcePlatform?: string;
  manualGuideText?: string | null;
  manualFileName?: string | null;
}

const DEFAULT_INSPECTION_ITEMS: InspectionPoint[] = [
  // Area Mesin
  {
    id: "eng-1",
    category: "Mesin",
    name: "Kondisi Oli & Lubang Pengisian Mesin",
    guideTip: "Buka tutup oli dengan senter. Jika ada endapan hitam pekat berpasir (sludge), oli jarang diganti.",
    status: "NG",
    notes: "Mulai berkerak faktor umur, butuh kuras/flush",
  },
  {
    id: "eng-2",
    category: "Mesin",
    name: "Seal Karter Mesin & Cover Valve",
    guideTip: "Periksa rembesan oli basah di sambungan blok mesin bagian atas dan bawah karter.",
    status: "OK",
    notes: "Kering, tidak ada tetesan oli aktif",
  },
  {
    id: "eng-3",
    category: "Mesin",
    name: "Radiator, Selang & Air Pendingin",
    guideTip: "Cek warna cairan radiator. Hindari mobil yang diisi air sumur/air biasa berkarat.",
    status: "OK",
    notes: "Masih pakai air biasa, disarankan kuras ganti coolant",
  },
  {
    id: "eng-4",
    category: "Mesin",
    name: "V-Belt & Pulley Idler Bearing",
    guideTip: "Dengarkan bunyi decit tajam saat mesin pertama kali dihidupkan.",
    status: "OK",
    notes: "Karet belt masih lentur",
  },
  {
    id: "eng-5",
    category: "Mesin",
    name: "Perpindahan Transmisi & Kopling",
    guideTip: "Injak kopling dan masukkan semua gigi (1-5 & R). Pastikan perpindahan halus tanpa menyentak.",
    status: "OK",
    notes: "Transmisi manual halus normal",
  },

  // Kaki-Kaki
  {
    id: "kaki-1",
    category: "Kaki-Kaki",
    name: "Ball Joint Bawah Kiri & Kanan",
    guideTip: "Raba karet boot balljoint di dekat piringan roda. Periksa apakah sobek atau mengeluarkan grease.",
    status: "NG",
    notes: "Karet boot balljoint kiri robek, pelumas bocor",
  },
  {
    id: "kaki-2",
    category: "Kaki-Kaki",
    name: "Karet Boot Racksteer & Long Tie Rod",
    guideTip: "Periksa karet spiral penutup racksteer. Karet robek membuat air masuk dan as racksteer berkarat/oblak.",
    status: "NG",
    notes: "Boot racksteer kanan sobek, butuh ganti karet",
  },
  {
    id: "kaki-3",
    category: "Kaki-Kaki",
    name: "Shock Absorber & Support Shock",
    guideTip: "Tekan sudut bodi mobil ke bawah lalu lepas. Mobil harus langsung berhenti mengayun dalam 1 pantulan.",
    status: "OK",
    notes: "Rebound shockbreaker masih normal, tidak amblas",
  },
  {
    id: "kaki-4",
    category: "Kaki-Kaki",
    name: "Bushing Arm & Link Stabilizer",
    guideTip: "Uji jalan melewati jalan berbatu pelan-pelan. Dengarkan apakah ada bunyi 'klutuk-klutuk'.",
    status: "OK",
    notes: "Karet bushing masih padat",
  },

  // Kelistrikan & AC
  {
    id: "listrik-1",
    category: "Kelistrikan",
    name: "Kekuatan Hembusan & Suhu Dingin AC",
    guideTip: "Nyalakan AC di putaran blower 2. Udara harus terasa dingin menusuk dalam 2-3 menit pertama.",
    status: "OK",
    notes: "AC dingin menggigil, kompresor halus",
  },
  {
    id: "listrik-2",
    category: "Kelistrikan",
    name: "Motor Extra Fan Radiator & AC",
    guideTip: "Pastikan kipas pendingin berputar kencang otomatis saat temperatur kerja mesin tercapai atau AC dinyalakan.",
    status: "OK",
    notes: "Kipas otomatis hidup saat AC ON",
  },
  {
    id: "listrik-3",
    category: "Kelistrikan",
    name: "Power Window & Central Lock 4 Pintu",
    guideTip: "Naik-turunkan semua kaca pintu pengemudi & penumpang. Pastikan tidak ada yang macet atau berderit keras.",
    status: "OK",
    notes: "4 pintu power window bekerja normal",
  },

  // Bodi & Sasis
  {
    id: "bodi-1",
    category: "Bodi & Sasis",
    name: "Apron & Tulang Bullhead Depan",
    guideTip: "Buka kap mesin. Periksa garis lipatan pelat bullhead apakah lurus pabrik atau ada bekas dempul/las getok.",
    status: "OK",
    notes: "Garis bullhead lurus orisinil, bebas bekas tabrakan",
  },
  {
    id: "bodi-2",
    category: "Bodi & Sasis",
    name: "Pilar A, B, C & Karet Pintu",
    guideTip: "Tarik karet lis pintu sedikit, periksa deretan titik las spot-weld pabrik.",
    status: "OK",
    notes: "Pilar kokoh presisi tidak ada sambungan potong",
  },
  {
    id: "bodi-3",
    category: "Bodi & Sasis",
    name: "Kondisi Cat & Bagasi",
    guideTip: "Ketuk bodi untuk mendeteksi dempul tebal. Buka karpet bagasi untuk melihat lantai ban serep.",
    status: "OK",
    notes: "Full repaint, bagasi ada sedikit karat oksidasi wajar",
  },
  {
    id: "bodi-4",
    category: "Bodi & Sasis",
    name: "Hidrolik Pintu Bagasi",
    guideTip: "Buka pintu bagasi belakang hingga maksimal. Pintu harus mampu menahan posisinya sendiri.",
    status: "OK",
    notes: "Mulai sedikit lemah, masih bisa menahan",
  },

  // Dokumen
  {
    id: "dok-1",
    category: "Dokumen",
    name: "Keaslian BPKB, Faktur & Pajak",
    guideTip: "Cocokkan nomor rangka dan nomor mesin di fisik mobil dengan lembar STNK dan BPKB.",
    status: "OK",
    notes: "Dokumen lengkap, nomor rangka & mesin akur",
  },
];

const INITIAL_TARGET_LISTING: TargetCarListing = {
  title: "Hyundai Atoz 1.0 GLS Manual 2002 Orisinil",
  make: "Hyundai",
  model: "Atoz",
  year: 2002,
  transmission: "Manual",
  askingPrice: 38000000,
  askingPriceFormatted: "Rp 38.000.000",
  odometer: 135000,
  sellerDescription:
    "Bismillah dijual Hyundai Atoz tahun 2002 pemakaian pribadi. Kondisi mesin kering halus no rembes, AC dingin menggigil, power window aktif, surat lengkap BPKB STNK faktur hidup, pajak on. Kaki-kaki senyap siap pakai luar kota. Lokasi COD pantau langsung nego bensin di tempat.",
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
};

export default function InspectionPage() {
  const { user } = useAuth();
  const userKey = user?.email || "default_user";

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Daftar Mobil Incaran Tersimpan
  const [targetCars, setTargetCars] = useState<TargetCar[]>([]);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Data Listing Mobil Incaran & Galeri
  const [fbUrl, setFbUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeSuccessNotice, setScrapeSuccessNotice] = useState<string | null>(null);
  const [targetListing, setTargetListing] = useState<TargetCarListing>(INITIAL_TARGET_LISTING);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showTargetDetails, setShowTargetDetails] = useState(false);

  const getSafeImageUrl = (url?: string) => {
    if (!url)
      return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80";
    if (url.startsWith("/api/proxy-image")) return url;
    if (url.includes("fbcdn.net") || url.includes("facebook.com")) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Muat daftar mobil incaran tersimpan dari local storage & database PostgreSQL
  useEffect(() => {
    const loaded = getStoredTargetCars(userKey);
    setTargetCars(loaded);

    syncTargetCarsWithDatabase(userKey).then((dbCars) => {
      if (dbCars && dbCars.length > 0) {
        setTargetCars(dbCars);
      }
    });
  }, [userKey]);

  // Navigasi Galeri Foto
  const handlePrevPhoto = () => {
    if (!targetListing.images || targetListing.images.length === 0) return;
    const newIdx =
      (activePhotoIndex - 1 + targetListing.images.length) % targetListing.images.length;
    setActivePhotoIndex(newIdx);
    setTargetListing((prev) => ({ ...prev, imageUrl: prev.images![newIdx] }));
  };

  const handleNextPhoto = () => {
    if (!targetListing.images || targetListing.images.length === 0) return;
    const newIdx = (activePhotoIndex + 1) % targetListing.images.length;
    setActivePhotoIndex(newIdx);
    setTargetListing((prev) => ({ ...prev, imageUrl: prev.images![newIdx] }));
  };

  const handleSelectPhoto = (idx: number) => {
    if (!targetListing.images || !targetListing.images[idx]) return;
    setActivePhotoIndex(idx);
    setTargetListing((prev) => ({ ...prev, imageUrl: prev.images![idx] }));
  };

  // Simpan mobil incaran ke local storage
  const handleSaveTargetCar = () => {
    const carId = targetListing.id || `target-${Date.now()}`;
    const photosToSave =
      targetListing.images && targetListing.images.length > 0
        ? targetListing.images
        : [targetListing.imageUrl];

    const carToSave: TargetCar = {
      id: carId,
      userId: user?.id || userKey,
      title: targetListing.title || `${targetListing.make} ${targetListing.model}`,
      make: targetListing.make,
      model: targetListing.model,
      year: targetListing.year,
      transmission: targetListing.transmission === "Matic" ? "Matic" : "Manual",
      askingPrice: targetListing.askingPrice,
      askingPriceFormatted:
        targetListing.askingPriceFormatted ||
        `Rp ${targetListing.askingPrice.toLocaleString("id-ID")}`,
      odometer: targetListing.odometer,
      sellerDescription: targetListing.sellerDescription,
      sellerClaims: targetListing.sellerClaims || [],
      imageUrl: targetListing.imageUrl,
      images: photosToSave,
      sourceUrl: targetListing.sourceUrl || fbUrl,
      sourcePlatform: targetListing.sourcePlatform || "Facebook Marketplace",
      manualGuideText: targetListing.manualGuideText || null,
      manualFileName: targetListing.manualFileName || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveStoredTargetCar(carToSave, userKey);
    setTargetCars(updated);
    setTargetListing((prev) => ({ ...prev, id: carId, images: photosToSave }));
    setSaveToast(`"${carToSave.title}" (${photosToSave.length} foto) tersimpan ke Mobil Incaran!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Pilih mobil tersimpan untuk inspeksi langsung di TKP
  const handleSelectForInspection = (car: TargetCar) => {
    const photos =
      car.images && car.images.length > 0 ? car.images : [car.imageUrl];
    setTargetListing({
      id: car.id,
      title: car.title,
      make: car.make,
      model: car.model,
      year: car.year,
      transmission: car.transmission,
      askingPrice: car.askingPrice,
      askingPriceFormatted: car.askingPriceFormatted,
      odometer: car.odometer,
      sellerDescription: car.sellerDescription,
      sellerClaims: car.sellerClaims,
      imageUrl: photos[0],
      images: photos,
      sourceUrl: car.sourceUrl,
      sourcePlatform: car.sourcePlatform,
      manualGuideText: car.manualGuideText,
      manualFileName: car.manualFileName,
    });
    setActivePhotoIndex(0);
    if (car.sourceUrl) setFbUrl(car.sourceUrl);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Edit mobil incaran tersimpan
  const handleEditTargetCar = (car: TargetCar) => {
    const photos =
      car.images && car.images.length > 0 ? car.images : [car.imageUrl];
    setTargetListing({
      id: car.id,
      title: car.title,
      make: car.make,
      model: car.model,
      year: car.year,
      transmission: car.transmission,
      askingPrice: car.askingPrice,
      askingPriceFormatted: car.askingPriceFormatted,
      odometer: car.odometer,
      sellerDescription: car.sellerDescription,
      sellerClaims: car.sellerClaims,
      imageUrl: photos[0],
      images: photos,
      sourceUrl: car.sourceUrl,
      sourcePlatform: car.sourcePlatform,
      manualGuideText: car.manualGuideText,
      manualFileName: car.manualFileName,
    });
    setActivePhotoIndex(0);
    setShowTargetDetails(true);
    if (car.sourceUrl) setFbUrl(car.sourceUrl);
    setCurrentStep(1);
    setTimeout(() => {
      document.getElementById("target-car-details")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Hapus mobil incaran tersimpan
  const handleDeleteTargetCar = (id: string, title: string) => {
    if (!window.confirm(`Hapus "${title}" dari daftar mobil incaran Anda?`)) return;
    const updated = deleteStoredTargetCar(id, userKey);
    setTargetCars(updated);
  };

  // Lembar Checklist Inspeksi
  const [items, setItems] = useState<InspectionPoint[]>(DEFAULT_INSPECTION_ITEMS);
  const [generalNotes, setGeneralNotes] = useState(
    "Unit Hyundai Atoz 2002 Manual. Mesin dan transmisi halus, kaki-kaki depan butuh peremajaan karet racksteer dan balljoint."
  );

  // Hasil Analisa AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Panduan visual tab
  const [activeGuideTab, setActiveGuideTab] = useState<number>(0);

  const handleFetchFbListing = async (inputUrl?: string) => {
    const url = inputUrl || fbUrl;
    if (!url.trim()) return;

    setIsScraping(true);
    setScrapeSuccessNotice(null);
    try {
      const res = await fetch("/api/scrape-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menarik data");

      setTargetListing(data);
      setActivePhotoIndex(0);
      setShowTargetDetails(true);
      if (inputUrl) setFbUrl(inputUrl);

      const photoCount = data.images?.length || (data.imageUrl ? 1 : 0);
      setScrapeSuccessNotice(
        `Berhasil menarik data: "${data.title}" • ${data.askingPriceFormatted || ""} • ${photoCount} Foto Tersedia`
      );

      setTimeout(() => {
        document.getElementById("target-car-details")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err: any) {
      alert(`Gagal mengambil data dari link: ${err.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === "OK" ? "NG" : "OK" } : item
      )
    );
  };

  const handleNotesChange = (id: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetListing,
          inspectionItems: items,
          generalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal analisa AI");
      setAiReport(data);
      setCurrentStep(3);

      setTimeout(() => {
        document.getElementById("ai-report-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err: any) {
      alert(`Terjadi kendala saat menganalisa: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyNegotiationScript = () => {
    if (!aiReport?.financialValuation?.negotiationScript) return;
    navigator.clipboard.writeText(aiReport.financialValuation.negotiationScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const ngCount = items.filter((i) => i.status === "NG").length;
  const okCount = items.filter((i) => i.status === "OK").length;

  const inspectionGuides = [
    {
      title: "1. Ruang Mesin & Lubang Oli",
      icon: Wrench,
      tips: [
        "Buka tutup pengisian oli mesin dengan senter. Amati permukaan dalam: jika terdapat kerak hitam pekat menggumpal (oil sludge), tandanya oli jarang diganti atau pernah overheating.",
        "Nyalakan mesin stasioner (idle). Dengarkan apakah ada bunyi klep kasar ('tik-tik-tik') atau dengung alternator.",
        "Periksa sambungan selang radiator dan paking karter di bawah mesin dari tetesan oli aktif.",
      ],
    },
    {
      title: "2. Kaki-Kaki & Kolong Depan",
      icon: ShieldCheck,
      tips: [
        "Goyang roda depan pada posisi jam 12 dan 6 untuk memeriksa kelonggaran bearing roda.",
        "Goyang roda pada posisi jam 9 dan 3 untuk mendeteksi tie rod dan long rack end yang oblak.",
        "Senter karet boot spiral racksteer di balik roda depan: jika sobek, debu dan air lumpur cepat merusak as pinion kemudi.",
        "Periksa karet balljoint bawah: jika sobek atau basah pelumas, segera ganti agar roda tidak copot saat menikung kencang.",
      ],
    },
    {
      title: "3. Struktur Sasis Bebas Tabrakan",
      icon: Car,
      tips: [
        "Buka kap mesin dan periksa tulang bullhead (pelat melintang depan radiator). Garis pelat harus lurus sempurna dengan bulatan titik las pabrik (spot weld) orisinal.",
        "Amati apron rumah sokbreker kiri dan kanan: tidak boleh ada bekas dempul keriput atau cat semprotan kasar baru.",
        "Tarik sedikit karet lis pintu pengemudi & penumpang untuk melihat apakah sambungan pilar A, B, C masih standar pabrik.",
      ],
    },
    {
      title: "4. Indikasi Bebas Banjir",
      icon: Info,
      tips: [
        "Tengok kolong dashboard dekat pedal rem dan pedal gas: periksa baut bracket besi apakah ada karat merah tebal bekas rendaman air.",
        "Buka karpet dasar di bawah jok pengemudi, raba apakah ada bau apek busuk atau endapan pasir lumpur.",
        "Cek soket sekring (fuse box) interior dari indikasi kerak putih korosi tembaga.",
      ],
    },
  ];

  // Jika pengunjung belum login, tampilkan showcase interaktif inspektor mobil & scraper FB
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 pb-28 max-w-6xl mx-auto transition-colors">
        <InspectionPublicShowcase />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 p-4 sm:p-6 pb-28 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Asisten Inspektur Mobil Bekas • TORQ AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            <span>Inspeksi Mobil Incaran & Verifikasi Iklan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Tarik data iklan Facebook Marketplace beserta seluruh fotonya, simpan mobil incaran Anda, dan bandingkan klaim penjual dengan fakta nyata di TKP didukung AI.
          </p>
        </div>
      </div>

      {/* Step Tracker */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            currentStep === 1
              ? "bg-white bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/10 dark:border-blue-500"
              : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className={`font-semibold ${currentStep === 1 ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
              Langkah 1
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                currentStep === 1 ? "bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-900" : "bg-slate-300"
              }`}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
            Mobil Incaran & FB Link
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            currentStep === 2
              ? "bg-white bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/10 dark:border-blue-500"
              : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className={`font-semibold ${currentStep === 2 ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
              Langkah 2
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                currentStep === 2 ? "bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-900" : "bg-slate-300"
              }`}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
            Checklist & Panduan Fisik
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
            currentStep === 3
              ? "bg-white bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/10 dark:border-blue-500"
              : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className={`font-semibold ${currentStep === 3 ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
              Langkah 3
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                currentStep === 3 ? "bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-900" : "bg-slate-300"
              }`}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
            Hasil Analisa & Nego AI
          </span>
        </button>
      </div>

      {/* ================= STEP 1: INPUT MOBIL INCARAN ================= */}
      {currentStep === 1 && (
        <section className="space-y-6">
          {/* DAFTAR MOBIL INCARAN TERSIMPAN */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
                  <BookmarkCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Daftar Mobil Incaran Tersimpan</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {targetCars.length} Unit
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Koleksi mobil yang Anda incar. Begitu sampai di TKP, klik &quot;Mulai Inspeksi di TKP&quot;.
                  </p>
                </div>
              </div>
            </div>

            {saveToast && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{saveToast}</span>
              </div>
            )}

            {targetCars.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50/80 border-2 border-dashed border-slate-200 text-center space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-white text-orange-500 shadow-sm mx-auto flex items-center justify-center border border-slate-200">
                  <Car className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">Belum ada mobil incaran yang disimpan</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                  Tarik data dari link Facebook di bawah atau masukkan manual, lalu klik &quot;Simpan ke Daftar Mobil Incaran&quot; agar tersimpan saat Anda berangkat ke lokasi penjual.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {targetCars.map((car) => {
                  const photoList = car.images && car.images.length > 0 ? car.images : [car.imageUrl];
                  return (
                    <div
                      key={car.id}
                      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
                    >
                      <div>
                        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                          <Image
                            src={getSafeImageUrl(car.imageUrl)}
                            alt={car.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-slate-800 shadow-sm backdrop-blur-sm border border-slate-200">
                            {car.sourcePlatform || "Listing"}
                          </div>

                          {/* Badge Jumlah Foto */}
                          {photoList.length > 1 && (
                            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm flex items-center gap-1 shadow-sm">
                              <ImageIcon className="h-3 w-3 text-amber-400" />
                              <span>{photoList.length} Foto</span>
                            </div>
                          )}

                          <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-xl bg-white/95 text-xs font-black text-emerald-700 font-mono shadow-md border border-emerald-200 backdrop-blur-sm">
                            {car.askingPriceFormatted || `Rp ${car.askingPrice.toLocaleString("id-ID")}`}
                          </div>
                        </div>

                        <div className="p-4 space-y-2.5">
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {car.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                              {car.year} • {car.transmission}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono">
                              {car.odometer ? `${car.odometer.toLocaleString("id-ID")} km` : "KM N/A"}
                            </span>
                          </div>

                          {car.sellerClaims && car.sellerClaims.length > 0 && (
                            <div className="pt-1">
                              <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                                Klaim Iklan Penjual:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {car.sellerClaims.slice(0, 2).map((claim, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] text-slate-700 border border-slate-200 line-clamp-1"
                                  >
                                    ✓ {claim}
                                  </span>
                                ))}
                                {car.sellerClaims.length > 2 && (
                                  <span className="text-[10px] text-slate-500 font-medium self-center">
                                    +{car.sellerClaims.length - 2} lagi
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 pt-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectForInspection(car)}
                          className="flex-1 min-h-[40px] px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          <Compass className="h-4 w-4" />
                          <span>Mulai Inspeksi TKP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditTargetCar(car)}
                          className="h-[40px] w-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
                          title="Edit Data Mobil Incaran"
                          aria-label="Edit Mobil Incaran"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTargetCar(car.id, car.title)}
                          className="h-[40px] w-[40px] rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-transparent hover:border-rose-200 flex items-center justify-center transition-all"
                          title="Hapus Mobil Incaran"
                          aria-label="Hapus Mobil Incaran"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Tarik Data Facebook Marketplace */}
          <div className="rounded-3xl bg-gradient-to-r from-sky-500/10 via-white to-amber-500/10 border border-sky-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/30">
                <LinkIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Tarik Otomatis dari Link Facebook Marketplace
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                    Auto-Detect Multi-Foto
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Tempel link postingan Facebook Marketplace (termasuk link share). TORQ AI akan otomatis mengunduh spesifikasi, deskripsi penjual, dan seluruh foto unit.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFetchFbListing();
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="url"
                value={fbUrl}
                onChange={(e) => setFbUrl(e.target.value)}
                placeholder="https://www.facebook.com/share/... atau https://www.facebook.com/marketplace/item/..."
                className="flex-1 min-h-[46px] px-4 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={isScraping || !fbUrl.trim()}
                className="min-h-[46px] px-6 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
              >
                {isScraping ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengekstrak Foto & Data FB...</span>
                  </>
                ) : (
                  <>
                    <span>Tarik Data Iklan</span>
                    <ExternalLink className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Success Banner */}
            {scrapeSuccessNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{scrapeSuccessNotice}</span>
              </div>
            )}
            {/* Action to manually toggle details */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Belum ada link atau ingin input spesifikasi mobil secara manual?
              </span>
              <button
                type="button"
                onClick={() => setShowTargetDetails((prev) => !prev)}
                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{showTargetDetails ? "Sembunyikan Spesifikasi" : "Input Spesifikasi Manual"}</span>
                <span>{showTargetDetails ? "▲" : "▼"}</span>
              </button>
            </div>
          </div>

          {/* Form Detail Mobil Incaran & Preview Foto Galeri (Sembunyi default jika belum ada link yang ditarik atau klik edit) */}
          {showTargetDetails && (
            <div
              id="target-car-details"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                  <Car className="h-5 w-5 text-orange-500" />
                  <span>Spesifikasi Mobil Incaran & Galeri Foto</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {targetListing.sourcePlatform || "Data Mobil"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTargetDetails(false)}
                    className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors text-xs font-bold"
                    title="Sembunyikan Form Spesifikasi"
                    aria-label="Tutup form spesifikasi"
                  >
                    ✕
                  </button>
                </div>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolom Kiri: Galeri Foto Mobil Incaran */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-orange-500" />
                    <span>Galeri Foto Mobil ({targetListing.images?.length || 1} Foto)</span>
                  </label>
                  {targetListing.images && targetListing.images.length > 1 && (
                    <span className="text-[11px] font-semibold text-orange-600">
                      Foto {activePhotoIndex + 1} / {targetListing.images.length}
                    </span>
                  )}
                </div>

                {/* Display Foto Utama dengan Tombol Navigasi */}
                <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner group">
                  <Image
                    src={getSafeImageUrl(targetListing.imageUrl)}
                    alt={targetListing.title}
                    fill
                    unoptimized
                    className="object-cover transition-all duration-300"
                  />

                  {/* Price Tag Pill */}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-white/95 text-xs font-black text-emerald-700 font-mono shadow-md border border-emerald-200 backdrop-blur-sm">
                    {targetListing.askingPriceFormatted}
                  </div>

                  {/* Tombol Panah Prev / Next */}
                  {targetListing.images && targetListing.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-95"
                        aria-label="Foto sebelumnya"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-95"
                        aria-label="Foto selanjutnya"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Selector Strip */}
                {targetListing.images && targetListing.images.length > 1 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pilih foto untuk melihat atau menjadikannya foto profil mobil:
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-thin">
                      {targetListing.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPhoto(idx)}
                          className={`relative h-16 w-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            activePhotoIndex === idx
                              ? "border-orange-500 ring-2 ring-orange-500/30 scale-105 shadow-md"
                              : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                          }`}
                        >
                          <Image
                            src={getSafeImageUrl(img)}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          {activePhotoIndex === idx && (
                            <span className="absolute bottom-0 inset-x-0 bg-orange-600 text-[8px] text-white font-bold py-0.5 text-center">
                              Aktif
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    URL Foto Utama (Dapat diedit manual jika perlu):
                  </label>
                  <input
                    type="text"
                    value={targetListing.imageUrl}
                    onChange={(e) =>
                      setTargetListing({ ...targetListing, imageUrl: e.target.value })
                    }
                    placeholder="URL Foto Mobil..."
                    className="w-full min-h-[38px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Kolom Kanan: Form Input Data Mobil */}
              <div className="lg:col-span-7 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Judul Iklan Penjualan
                  </label>
                  <input
                    type="text"
                    value={targetListing.title}
                    onChange={(e) =>
                      setTargetListing({ ...targetListing, title: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Merek</label>
                    <input
                      type="text"
                      value={targetListing.make}
                      onChange={(e) =>
                        setTargetListing({ ...targetListing, make: e.target.value })
                      }
                      className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Model</label>
                    <input
                      type="text"
                      value={targetListing.model}
                      onChange={(e) =>
                        setTargetListing({ ...targetListing, model: e.target.value })
                      }
                      className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tahun</label>
                    <input
                      type="number"
                      value={targetListing.year}
                      onChange={(e) =>
                        setTargetListing({ ...targetListing, year: Number(e.target.value) })
                      }
                      className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Transmisi</label>
                    <select
                      aria-label="Pilih transmisi"
                      value={targetListing.transmission}
                      onChange={(e) =>
                        setTargetListing({ ...targetListing, transmission: e.target.value })
                      }
                      className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Matic">Matic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Harga Buka Penjual (Rp)
                    </label>
                    <input
                      type="number"
                      value={targetListing.askingPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTargetListing({
                          ...targetListing,
                          askingPrice: val,
                          askingPriceFormatted: `Rp ${val.toLocaleString("id-ID")}`,
                        });
                      }}
                      className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Odometer Klaim (KM)
                    </label>
                    <input
                      type="number"
                      value={targetListing.odometer}
                      onChange={(e) =>
                        setTargetListing({ ...targetListing, odometer: Number(e.target.value) })
                      }
                      className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Deskripsi / Klaim Penjual dari Postingan Facebook
                  </label>
                  <textarea
                    rows={10}
                    value={targetListing.sellerDescription}
                    onChange={(e) =>
                      setTargetListing({ ...targetListing, sellerDescription: e.target.value })
                    }
                    placeholder="Salin teks deskripsi iklan penjual..."
                    className="w-full min-h-[220px] p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveTargetCar}
                className="w-full sm:w-auto min-h-[46px] px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <Bookmark className="h-4 w-4 text-orange-500" />
                <span>Simpan ke Daftar Mobil Incaran</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSaveTargetCar();
                  setCurrentStep(2);
                }}
                className="w-full sm:w-auto min-h-[46px] px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Lanjut ke Lembar Kerja Inspeksi Fisik</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
      )}

      {/* ================= STEP 2: CHECKLIST & PANDUAN INSPEKSI ================= */}
      {currentStep === 2 && (
        <section className="space-y-6">
          {/* Target Car Summary Bar */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500/10 via-white to-amber-500/10 border border-orange-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="relative h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-orange-300 shadow-sm">
                <Image
                  src={getSafeImageUrl(targetListing.imageUrl)}
                  alt={targetListing.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider block">
                  Target Inspeksi di TKP:
                </span>
                <h3 className="text-sm font-bold text-slate-900">{targetListing.title}</h3>
                <span className="text-xs text-emerald-700 font-bold font-mono">
                  {targetListing.askingPriceFormatted}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs self-start sm:self-auto transition-all"
            >
              Ubah Data Iklan
            </button>
          </div>

          {/* Panduan Visual Edukasi */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Panduan Visual: Cara Praktis Memeriksa Mobil di Lokasi
                </h2>
                <p className="text-xs text-slate-500">
                  Ikuti teknik mekanik profesional berikut saat memeriksa unit langsung di hadapan penjual
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {inspectionGuides.map((guide, idx) => {
                const Icon = guide.icon;
                const isActive = activeGuideTab === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveGuideTab(idx)}
                    className={`p-3 rounded-2xl text-left border transition-all text-xs flex items-center gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span className="line-clamp-1">{guide.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl bg-orange-50/50 border border-orange-200/80 p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold text-orange-900">
                {inspectionGuides[activeGuideTab].title}
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {inspectionGuides[activeGuideTab].tips.map((tip, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="h-5 w-5 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {tIdx + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AR Component 3D HUD Guide Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center shrink-0 shadow-md shadow-sky-500/10">
                <Crosshair className="h-6 w-6 animate-spin text-sky-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    Bingung Mencari Letak Fisik Komponen saat Inspeksi?
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-sky-400 text-slate-950 uppercase">
                    AR HUD 3D
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Gunakan visualisasi interaktif AR untuk melihat posisi pasti tutup radiator, tie rod, dipstick oli, rack steer, dan sasis dengan reticle target.
                </p>
              </div>
            </div>

            <Link
              href="/ar-inspector"
              className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>Buka Panduan AR Komponen Fisik</span>
            </Link>
          </div>

          {/* Checklist Lapangan */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-orange-500" />
                  <span>Lembar Kerja Inspeksi Fisik Lapangan</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Uji setiap komponen. Klik <span className="text-emerald-600 font-bold">OK (Baik)</span> atau{" "}
                  <span className="text-rose-600 font-bold">NG (Rusak)</span> dan tuliskan catatan temuannya.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {okCount} Kondisi Baik
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {ngCount} Temuan PR
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all shadow-xs ${
                    item.status === "NG"
                      ? "border-rose-300 bg-rose-50/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        💡 <span className="italic">{item.guideTip}</span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => item.status !== "OK" && handleToggleStatus(item.id)}
                          className={`min-h-[38px] px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            item.status === "OK"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>OK</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => item.status !== "NG" && handleToggleStatus(item.id)}
                          className={`min-h-[38px] px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            item.status === "NG"
                              ? "bg-rose-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>NG (Rusak)</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Catatan temuan di lokasi..."
                        value={item.notes}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        className="min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 w-full sm:w-56"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Run AI Analysis Action */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-50 via-white to-amber-50 border-2 border-orange-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Catatan Keseluruhan Kondisi Unit oleh Pengguna
                </label>
                <textarea
                  rows={2}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Catatan tambahan hasil test drive atau obrolan dengan penjual..."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed shadow-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold border border-slate-300"
                >
                  &larr; Kembali ke Data Iklan
                </button>

                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto min-h-[48px] px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menganalisa & Verifikasi Klaim Penjual dengan TORQ AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Analisa Hasil Inspeksi & Komparasi Klaim Penjual</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= STEP 3: HASIL ANALISA AI GEMINI & KLAIM VS FAKTA ================= */}
      {currentStep === 3 && aiReport && (
        <section
          id="ai-report-section"
          className="space-y-6 animate-in fade-in zoom-in-95 duration-300"
        >
          {/* Header Report Card */}
          <div className="rounded-3xl bg-white border-2 border-orange-400 p-6 sm:p-7 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-orange-300 shadow-sm">
                  <Image
                    src={targetListing.imageUrl}
                    alt={targetListing.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      Hasil Analisa Kelayakan & Verifikasi Iklan
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      TORQ AI • {aiReport.modelUsed || "GEMINI_3.8_FLASH"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    {targetListing.title} ({targetListing.year})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {aiReport.safetyAssessment?.isFloodFree && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Bebas Banjir
                  </span>
                )}
                {aiReport.safetyAssessment?.isAccidentFree && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Bebas Tabrak
                  </span>
                )}
              </div>
            </div>

            {/* Scores Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Skor Kondisi Komponen Kendaraan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-center shadow-sm space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">Skor Total</span>
                  <span className="text-3xl font-black">
                    {aiReport.scores?.overallHealthScore || 78}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Mesin</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {aiReport.scores?.engineScore || 80}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Transmisi</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {aiReport.scores?.transmissionScore || 85}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Kaki-Kaki</span>
                  <span className="text-2xl font-black text-amber-600">
                    {aiReport.scores?.chassisAndSuspensionScore || 75}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Eksterior</span>
                  <span className="text-2xl font-black text-slate-700">
                    {aiReport.scores?.exteriorScore || 75}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Interior</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {aiReport.scores?.interiorScore || 80}%
                  </span>
                </div>
              </div>
            </div>

            {/* ================= FACT CHECK: KLAIM PENJUAL VS FAKTA LAPANGAN ================= */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Verifikasi Klaim Penjual vs Fakta Lapangan
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Pemeriksaan terhadap janji di deskripsi postingan penjual dibandingkan temuan fisik nyata di lokasi.
              </p>

              <div className="space-y-2.5">
                {aiReport.claimsVerification?.map((c: any, idx: number) => {
                  const isVerified = c.verdict === "TERBUKTI";
                  const isDebunked = c.verdict === "TERBANTAHKAN";
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                        isVerified
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                          : isDebunked
                          ? "bg-rose-50/80 border-rose-200 text-rose-950"
                          : "bg-amber-50/80 border-amber-200 text-amber-950"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">
                          Klaim Penjual: <span className="italic text-slate-900">&quot;{c.claim}&quot;</span>
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                            isVerified
                              ? "bg-emerald-600 text-white"
                              : isDebunked
                              ? "bg-rose-600 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {c.verdict}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        Fakta Temuan: {c.realityNote}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rekomendasi Service & Ganti Part */}
            {aiReport.repairs && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-500" />
                  <span>Daftar PR Perbaikan & Estimasi Biaya</span>
                </h3>

                <div className="space-y-2">
                  {aiReport.repairs.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              r.urgency === "HSP"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {r.urgency === "HSP" ? "HSP - Segera" : "SP - Waktu Dekat"}
                          </span>
                          <span className="font-bold text-slate-900">{r.item}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{r.reason}</p>
                      </div>

                      <div className="text-right sm:shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-700 block">
                          {r.costFormatted}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= VALUASI KEUANGAN & SKRIP NEGO ================= */}
            {aiReport.financialValuation && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/30 to-sky-50 border-2 border-emerald-300 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Strategi Valuasi & Penawaran Harga Pembeli
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Siap Pakai Nego
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block font-semibold">Harga Buka Penjual</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {aiReport.financialValuation.askingPriceFormatted}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs">
                    <span className="text-[10px] text-rose-600 block font-semibold">Estimasi Total Biaya PR</span>
                    <span className="text-base font-bold text-rose-600 font-mono">
                      {aiReport.financialValuation.estimatedTotalRepairCost}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border-2 border-emerald-400 shadow-xs">
                    <span className="text-[10px] text-emerald-700 block font-bold">Rekomendasi Tawar</span>
                    <span className="text-lg font-black text-emerald-700 font-mono">
                      {aiReport.financialValuation.recommendedOfferPrice}
                    </span>
                  </div>
                </div>

                {/* Skrip Kalimat Negosiasi */}
                {aiReport.financialValuation.negotiationScript && (
                  <div className="p-4 rounded-2xl bg-white border border-emerald-300/80 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Skrip Kalimat Nego ke Penjual (Berdasarkan Temuan):
                      </span>
                      <button
                        type="button"
                        onClick={copyNegotiationScript}
                        className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        {copiedScript ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedScript ? "Tersalin!" : "Salin Teks"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 italic leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      &quot;{aiReport.financialValuation.negotiationScript}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Back & New Inspection Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300"
              >
                &larr; Cek Ulang Lembar Fisik
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setAiReport(null);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                Inspeksi Mobil Incaran Lainnya
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

