"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  Wrench,
  CheckCircle2,
  ExternalLink,
  Car,
  Filter,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { getStoredVehicles } from "@/lib/storage/user-data";
import { Vehicle } from "@/types/automotive";

interface SparePart {
  id: string;
  name: string;
  category: "Filter" | "Pelumas" | "Pengereman" | "Pengapian" | "Kaki-Kaki" | "Mesin";
  suitableFor: string;
  targetCarKeyword: string; // kata kunci pencocokan, e.g. "atoz", "avanza", "brio", "universal"
  priceFormatted: string;
  stock: string;
  imageUrl: string;
  rating: number;
  recommendationReason?: string;
}

const PARTS_CATALOG: SparePart[] = [
  // --- Khusus Hyundai Atoz & Kia Visto ---
  {
    id: "part-atoz-1",
    name: "Filter Oli Mesin Genuine Hyundai Mobis (Atoz / Visto)",
    category: "Filter",
    suitableFor: "Hyundai Atoz 1.0 / 1.1, Kia Visto",
    targetCarKeyword: "atoz",
    priceFormatted: "Rp 38.000",
    stock: "Ready Stock (Garansi Ori)",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Kfz-oelfilter-muenze.jpg/960px-Kfz-oelfilter-muenze.jpg",
    rating: 4.9,
    recommendationReason: "Wajib ganti tiap 5.000 KM bersamaan oli mesin baru",
  },
  {
    id: "part-atoz-2",
    name: "Ball Joint Bawah Kiri & Kanan (555 Japan / Mobis)",
    category: "Kaki-Kaki",
    suitableFor: "Hyundai Atoz 2000-2008, Kia Visto",
    targetCarKeyword: "atoz",
    priceFormatted: "Rp 175.000",
    stock: "Ready Stock",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4c/VW_suspension_and_steering_%288716611295%29.jpg",
    rating: 4.9,
    recommendationReason: "Solusi bunyi jedug saat belok atau jalan berlubang",
  },
  {
    id: "part-atoz-3",
    name: "Karet Boot Steering Rack Steer Kiri / Kanan",
    category: "Kaki-Kaki",
    suitableFor: "Hyundai Atoz Manual / Matic",
    targetCarKeyword: "atoz",
    priceFormatted: "Rp 45.000",
    stock: "Ready Stock",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Tie_rod_end.jpeg",
    rating: 4.8,
    recommendationReason: "Mencegah pasir dan air masuk merusak gigi pinion steer",
  },
  {
    id: "part-atoz-4",
    name: "Kampas Rem Depan Bendix GCT Titanium (Hyundai Atoz)",
    category: "Pengereman",
    suitableFor: "Hyundai Atoz, Kia Visto, Kia Picanto Gen 1",
    targetCarKeyword: "atoz",
    priceFormatted: "Rp 185.000",
    stock: "Ready Stock",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Brake_pad.jpg/960px-Brake_pad.jpg",
    rating: 4.9,
    recommendationReason: "Pakem tanpa bunyi decit, tidak merusak piringan cakram",
  },
  {
    id: "part-atoz-5",
    name: "Timing Belt Kit + Tensioner Bearing Gates / Mobis",
    category: "Mesin",
    suitableFor: "Hyundai Atoz 1.0cc & 1.1cc",
    targetCarKeyword: "atoz",
    priceFormatted: "Rp 245.000",
    stock: "Ready Stock",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Replacing_a_timing_belt.jpg/960px-Replacing_a_timing_belt.jpg",
    rating: 5.0,
    recommendationReason: "Ganti tiap 50.000 KM agar klep tidak bertabrakan dengan piston",
  },
  {
    id: "part-atoz-6",
    name: "Busi NGK BPR5EY-11 Standard Copper (1 Set 4 Pcs)",
    category: "Pengapian",
    suitableFor: "Hyundai Atoz 1.0, Suzuki Karimun Kotak",
    targetCarKeyword: "atoz",
    priceFormatted: "Rp 90.000",
    stock: "Ready Stock",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Buj%C3%ADa_Bosch_Yttrium_Super_Plus.JPG/960px-Buj%C3%ADa_Bosch_Yttrium_Super_Plus.JPG",
    rating: 4.9,
    recommendationReason: "Tarikan enteng, irit bensin, dan stasioner tidak pincang",
  },
  {
    id: "part-atoz-7",
    name: "Tie Rod End & Long Rack End Set 555 Japan",
    category: "Kaki-Kaki",
    suitableFor: "Hyundai Atoz, Kia Visto",
    targetCarKeyword: "atoz",
    priceFormatted: "Rp 220.000",
    stock: "Tersedia",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Tie_rod_end.jpeg",
    rating: 4.8,
  },

  // --- Pelumas & Universal ---
  {
    id: "part-univ-1",
    name: "Oli Mesin Shell Helix HX6 10W-40 Semi Synthetic (4 Liter)",
    category: "Pelumas",
    suitableFor: "Cocok untuk mobil tahun 2000-2015 (Atoz, Avanza, Xenia, Brio)",
    targetCarKeyword: "universal",
    priceFormatted: "Rp 265.000",
    stock: "Ready Stock (Barcode Segel)",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/SIGAUS_aceite.jpg/960px-SIGAUS_aceite.jpg",
    rating: 4.9,
    recommendationReason: "Viskositas pas untuk mesin berjarak tempuh > 80.000 KM",
  },
  {
    id: "part-univ-2",
    name: "Minyak Rem Seiken DOT 4 Original Japan (1 Liter)",
    category: "Pengereman",
    suitableFor: "Semua mobil bensin manual / matic",
    targetCarKeyword: "universal",
    priceFormatted: "Rp 75.000",
    stock: "Ready Stock",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Delco_hydrolic_brake_fluid%2C_Super_11.JPG/960px-Delco_hydrolic_brake_fluid%2C_Super_11.JPG",
    rating: 4.8,
    recommendationReason: "Titik didih tinggi, cegah rem blong saat turunan curam",
  },
  {
    id: "part-univ-3",
    name: "Air Radiator Coolant Prestone Red / Green (1 Galon 4L)",
    category: "Pelumas",
    suitableFor: "Semua radiator mobil",
    targetCarKeyword: "universal",
    priceFormatted: "Rp 95.000",
    stock: "Ready Stock",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Automobile_radiator.jpg",
    rating: 4.8,
    recommendationReason: "Cegah karat & kerak pada kisi-kisi radiator",
  },

  // --- Toyota Avanza / Daihatsu Xenia ---
  {
    id: "part-avanza-1",
    name: "Kampas Rem Depan Bendix Metal King Titanium Avanza",
    category: "Pengereman",
    suitableFor: "Toyota Avanza, Veloz, Daihatsu Xenia, Rush, Terios",
    targetCarKeyword: "avanza",
    priceFormatted: "Rp 275.000",
    stock: "Tersedia",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Brake_pad.jpg/960px-Brake_pad.jpg",
    rating: 4.9,
  },
  {
    id: "part-avanza-2",
    name: "Filter Udara Mesin Denso Genuine Toyota Avanza Dual VVT-i",
    category: "Filter",
    suitableFor: "Toyota Avanza 1.3 / 1.5 Dual VVT-i, Calya, Sigra",
    targetCarKeyword: "avanza",
    priceFormatted: "Rp 95.000",
    stock: "Tersedia",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Dirty-air-filter.jpg",
    rating: 4.8,
  },
];

const CATEGORIES = ["SEMUA", "Kaki-Kaki", "Filter", "Pengereman", "Pelumas", "Mesin", "Pengapian"] as const;

export default function SparePartsPage() {
  const { user, loginWithGoogle } = useAuth();
  const userKey = user?.email || "default_user";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("SEMUA");

  useEffect(() => {
    const loaded = getStoredVehicles(userKey);
    setVehicles(loaded);
    if (loaded.length > 0) {
      setSelectedVehicle(loaded[0]);
    }
  }, [userKey]);

  // Urutkan katalog: Prioritaskan suku cadang yang cocok dengan mobil terdaftar
  const sortedAndFilteredParts = React.useMemo(() => {
    const activeCarModel = selectedVehicle
      ? `${selectedVehicle.make} ${selectedVehicle.model}`.toLowerCase()
      : "";

    return PARTS_CATALOG.filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(search.toLowerCase()) ||
        part.suitableFor.toLowerCase().includes(search.toLowerCase()) ||
        part.category.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === "SEMUA" || part.category === selectedCategory;

      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      // Prioritaskan mobil aktif
      const aMatches =
        activeCarModel.includes(a.targetCarKeyword) || a.targetCarKeyword === "universal";
      const bMatches =
        activeCarModel.includes(b.targetCarKeyword) || b.targetCarKeyword === "universal";

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }, [selectedVehicle, search, selectedCategory]);

  const getTokopediaUrl = (part: SparePart) => {
    const carSuffix = selectedVehicle
      ? `${selectedVehicle.make} ${selectedVehicle.model}`
      : "";
    const query = `${part.name} ${carSuffix}`.trim();
    return `https://www.tokopedia.com/search?st=product&q=${encodeURIComponent(query)}`;
  };

  const getShopeeUrl = (part: SparePart) => {
    const carSuffix = selectedVehicle
      ? `${selectedVehicle.make} ${selectedVehicle.model}`
      : "";
    const query = `${part.name} ${carSuffix}`.trim();
    return `https://shopee.co.id/search?keyword=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 p-4 sm:p-6 pb-28 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            <span>Katalog Suku Cadang Terkurasi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Suku cadang terverifikasi OEM & aftermarket berkualitas untuk mobil Anda dengan direct search Tokopedia & Shopee.
          </p>
        </div>

        {/* Vehicle Badge Selector */}
        {vehicles.length > 0 && (
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Car className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Prioritas Mobil Garasi:</span>
              <select
                aria-label="Pilih mobil garasi"
                value={selectedVehicle?.id || ""}
                onChange={(e) => {
                  const found = vehicles.find((v) => v.id === e.target.value);
                  if (found) setSelectedVehicle(found);
                }}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">
                    {v.make} {v.model} ({v.year})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Non-Logged In Conversion Banner */}
      {!user && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 p-8 md:p-10 text-white shadow-xl shadow-blue-600/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md text-sky-100 border border-white/20">
                <Sparkles className="h-3 w-3" /> Fitur AI Part-Matching
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                Pusing Cari Sparepart yang 100% Cocok (Plug & Play)?
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Daftarkan mobil Anda di Garasi BengkelSaku. Sistem dan AI kami akan langsung memfilter ribuan komponen dan merekomendasikan part OEM/aftermarket yang dijamin pas dengan nomor seri, tipe, dan tahun mobil Anda!
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-600 font-extrabold text-sm rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>Daftar Gratis dengan Google</span>
              </button>
            </div>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      )}

      {/* Info Prioritas Kendaraan Terpilih */}
      {selectedVehicle && (
        <div className="rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 flex items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-slate-800 dark:text-slate-200">
              Menampilkan suku cadang yang diprioritaskan khusus untuk{" "}
              <strong className="text-blue-950 dark:text-blue-300 font-black">
                {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
              </strong>
            </span>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Katalog Tercocokkan
          </span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 space-y-3.5 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari suku cadang (contoh: kampas rem, filter oli, balljoint ${selectedVehicle ? selectedVehicle.model : ""})...`}
            className="w-full min-h-[46px] pl-10 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Parts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedAndFilteredParts.map((part) => {
          const isMatchingActiveCar =
            selectedVehicle &&
            `${selectedVehicle.make} ${selectedVehicle.model}`
              .toLowerCase()
              .includes(part.targetCarKeyword);

          return (
            <article
              key={part.id}
              className={`rounded-3xl bg-white dark:bg-slate-900 border overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${
                isMatchingActiveCar
                  ? "border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20"
                  : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={part.imageUrl}
                    alt={part.name}
                    fill
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/95 dark:bg-slate-900/90 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 backdrop-blur-sm shadow-xs">
                      {part.category}
                    </span>
                    {isMatchingActiveCar && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                        Cocok: {selectedVehicle?.model}
                      </span>
                    )}
                  </div>
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 dark:bg-slate-900/90 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 backdrop-blur-sm shadow-xs">
                    ⭐ {part.rating}
                  </span>
                </div>

                <div className="p-5 space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {part.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kesesuaian: <span className="text-slate-800 dark:text-slate-200 font-semibold">{part.suitableFor}</span>
                  </p>

                  {part.recommendationReason && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 leading-tight">
                      💡 {part.recommendationReason}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {part.priceFormatted}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {part.stock}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Working Marketplace Buttons */}
              <div className="p-5 pt-0 space-y-2">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase">
                  Beli Langsung di E-Commerce:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Tokopedia */}
                  <a
                    href={getTokopediaUrl(part)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[42px] rounded-xl bg-white dark:bg-slate-800 hover:bg-[#00AA5B] hover:text-white hover:border-[#00AA5B] text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-xs"
                    title={`Cari "${part.name}" di Tokopedia`}
                  >
                    <span>Tokopedia</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  {/* Shopee */}
                  <a
                    href={getShopeeUrl(part)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[42px] rounded-xl bg-white dark:bg-slate-800 hover:bg-[#EE4D2D] hover:text-white hover:border-[#EE4D2D] text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-xs"
                    title={`Cari "${part.name}" di Shopee`}
                  >
                    <span>Shopee</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
