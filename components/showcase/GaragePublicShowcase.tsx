"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Wrench,
  Sparkles,
  BookOpen,
  Camera,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gauge,
  Layers,
  ChevronRight,
  LogIn,
  Eye,
  Sliders,
  Car,
  Clock,
  Crosshair,
  ExternalLink,
  Star,
  Activity,
  History,
  LayoutDashboard,
  FileText,
  Cpu,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

const DEMO_GARAGE_VEHICLES = [
  {
    id: "demo-avanza",
    make: "Toyota",
    model: "Avanza Veloz 1.5 AT",
    year: 2021,
    plate: "B 1945 TKO",
    odometer: 42500,
    readiness: 94,
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
    manualSummary:
      "Oli SAE 0W-20 (3.3L) • Timing Chain Bebas Rawat • Busi Iridium FK20HR11 • Transmisi ATF WS • Ban 185/65 R15 (33/36 PSI)",
    nextService: "Ganti Oli Mesin & Filter",
    serviceRemaining: "Sisa 2.500 km",
    oilSpec: "SAE 0W-20 API SP",
  },
  {
    id: "demo-brio",
    make: "Honda",
    model: "Brio Satya 1.2 E CVT",
    year: 2022,
    plate: "D 1289 VBS",
    odometer: 28000,
    readiness: 98,
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
    manualSummary:
      "Oli SAE 0W-20 Honda E-Pro (3.6L) • Transmisi HCF-2 CVT (3.4L Wajib Kuras) • Busi Iridium Long Life • Ban 175/65 R14 (30 PSI)",
    nextService: "Kuras Oli Transmisi CVT HCF-2",
    serviceRemaining: "Sisa 12.000 km",
    oilSpec: "SAE 0W-20 Honda Ultra LEO",
  },
  {
    id: "demo-atoz",
    make: "Hyundai",
    model: "Atoz 1.0 GLS Manual",
    year: 2002,
    plate: "B 2002 AZ",
    odometer: 135000,
    readiness: 88,
    imageUrl:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Hyundai_Atos_1.0_GL_2000.jpg/1280px-Hyundai_Atos_1.0_GL_2000.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    manualSummary:
      "Oli SAE 10W-40 (3.1L) • Timing Belt WAJIB Tiap 50.000 KM • Busi NGK BPR5EY-11 • MTF SAE 75W-85 (2.1L) • Ban 155/70 R13",
    nextService: "Pemeriksaan Timing Belt & Rem",
    serviceRemaining: "Sisa 5.000 km",
    oilSpec: "SAE 10W-40 API SL/CF",
  },
];

export function GaragePublicShowcase() {
  const { loginWithGoogle } = useAuth();
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const activeCar = DEMO_GARAGE_VEHICLES[selectedDemoIndex];

  return (
    <div className="pt-4 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
      {/* 1. Hero Promotional Header */}
      <div className="text-center max-w-4xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold uppercase tracking-widest shadow-xs">
          <Star className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          <span>Digital Garage 2.0 • Telemetry & AI Manual</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
          Garasi Digital Pintar{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500">
            Terintegrasi TORQ AI
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-normal text-base sm:text-lg leading-relaxed">
          Tinggalkan buku manual tebal 400 halaman di laci dashboard. Daftarkan mobil Anda,
          unggah dokumen servis atau buku panduan pabrikan, dan biarkan AI menyarikan
          viskositas fluida, torsi baut, serta kalkulasi umur komponen secara real-time.
        </p>
      </div>

      {/* 2. Interactive Digital Car Cockpit Card */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-xl shadow-blue-500/5 backdrop-blur-md overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-slate-100 dark:border-slate-800/80 pb-6 relative z-10">
          <div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Live Interactive Garage Preview
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Eksplorasi Telemetri Unit Digital
            </h2>
          </div>
          {/* Unit Switcher Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            {DEMO_GARAGE_VEHICLES.map((car, idx) => (
              <button
                key={car.id}
                type="button"
                onClick={() => setSelectedDemoIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedDemoIndex === idx
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-100"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60"
                }`}
              >
                {car.make} {car.model.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Cockpit Card Layout */}
        <div className="flex flex-col lg:flex-row gap-8 relative z-10">
          {/* Car Image Visualizer */}
          <div className="lg:w-2/5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between p-6 relative overflow-hidden group min-h-[340px]">
            {activeCar.imageUrl ? (
              <div className="absolute inset-0">
                <Image
                  src={activeCar.imageUrl}
                  alt={activeCar.model}
                  fill
                  className="object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>
            ) : (
              <Car className="w-24 h-24 text-slate-700 mx-auto my-auto" />
            )}

            {/* Top Badges */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-black tracking-widest bg-slate-900/90 text-white border border-white/20 shadow-lg backdrop-blur-md">
                {activeCar.plate}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Kesiapan: {activeCar.readiness}%
              </span>
            </div>

            {/* Bottom Info Overlay */}
            <div className="relative z-10 pt-16">
              <div className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-widest">
                Tahun {activeCar.year} • Fleet Certified
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {activeCar.make} {activeCar.model}
              </div>
            </div>
          </div>

          {/* Telemetry & Specifications */}
          <div className="lg:w-3/5 flex flex-col justify-between gap-6">
            {/* 3 Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Odometer
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {activeCar.odometer.toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-sans text-slate-500">KM</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Servis Terdekat
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {activeCar.nextService}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  {activeCar.serviceRemaining}
                </div>
              </div>

              <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Viskositas Fluida
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 font-mono">
                  {activeCar.oilSpec}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Rekomendasi OEM
                </div>
              </div>
            </div>

            {/* AI Manual Extraction Callout */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50/40 dark:from-blue-950/30 dark:to-slate-900/80 border border-blue-100 dark:border-blue-900/60 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Rangkuman Spesifikasi Manual AI Pabrikan:
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                  Ekstraksi Presisi
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed bg-white/80 dark:bg-slate-900/70 p-3.5 rounded-xl border border-blue-100/80 dark:border-slate-800 shadow-2xs">
                {activeCar.manualSummary}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/ar-inspector?demo=${activeCar.id}`}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Crosshair className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Uji Coba Visual AR 3D Mobil Ini</span>
              </Link>
              <button
                type="button"
                onClick={loginWithGoogle}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Wrench className="w-4 h-4" />
                <span>Daftarkan Mobil Saya Sendiri</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Three Pillars Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-3.5 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all group">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Kompresi Panduan PDF ke AI
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Unggah file buku manual PDF pabrikan mobil Anda. Sistem mengekstrak spesifikasi fluida,
            torsi pengencangan baut, dan jadwal interval tanpa menghabiskan kuota token chat besar.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-3.5 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all group">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Visual AR Foto Mesin Aktual
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Foto ruang mesin mobil Anda langsung dari kamera ponsel. AI memindai letak komponen,
            alternator, sensor throttle, tabung rem, dan memudahkan identifikasi visual langsung.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-3.5 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all group">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Gauge className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Histori Servis & Kesiapan Unit
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Kalkulasi indeks kesiapan kendaraan memberi Anda keyakinan saat akan menempuh
            perjalanan luar kota tanpa khawatir mogok tak terduga di tengah jalan.
          </p>
        </div>
      </section>
    </div>
  );
}
