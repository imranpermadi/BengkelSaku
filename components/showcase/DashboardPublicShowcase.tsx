"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  Sparkles,
  Bot,
  Car,
  ClipboardCheck,
  CalendarCheck,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Camera,
  History,
  ChevronRight,
  Zap,
  Gauge,
  Sliders,
  Activity,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Volume2,
  Radio,
  Crosshair,
  TrendingUp,
  FileText,
  DollarSign,
  Maximize2,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

// Data Mobil Showcase
const SHOWCASE_FLEET = [
  {
    id: "avanza",
    brand: "TOYOTA",
    model: "Avanza Veloz 1.5 AT",
    year: 2021,
    plate: "B 1945 TKO",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
    baseKm: 42500,
    oilSpec: "0W-20 API SP (3.3L)",
    transType: "ATF WS",
    sparkPlug: "Iridium FK20HR11",
    timingType: "Timing Chain (Bebas Rawat)",
    tireSize: "185/65 R15 (33/36 PSI)",
  },
  {
    id: "brio",
    brand: "HONDA",
    model: "Brio Satya 1.2 E CVT",
    year: 2022,
    plate: "D 1289 VBS",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
    baseKm: 28000,
    oilSpec: "0W-20 Honda E-Pro (3.6L)",
    transType: "CVT HCF-2 Wajib Kuras",
    sparkPlug: "Iridium Long Life",
    timingType: "Timing Chain",
    tireSize: "175/65 R14 (30/30 PSI)",
  },
  {
    id: "atoz",
    brand: "HYUNDAI",
    model: "Atoz 1.0 GLS Manual",
    year: 2002,
    plate: "B 2002 AZ",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Hyundai_Atos_1.0_GL_2000.jpg/1280px-Hyundai_Atos_1.0_GL_2000.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    baseKm: 135400,
    oilSpec: "10W-40 API SL (3.1L)",
    transType: "MTF 75W-85 (2.1L)",
    sparkPlug: "NGK BPR5EY-11",
    timingType: "Timing Belt (Wajib Tiap 50.000 KM)",
    tireSize: "155/70 R13 (29/29 PSI)",
  },
];

// Data Gejala Interaktif Sandbox
const INTERACTIVE_DIAGNOSTICS = [
  {
    id: "misfire",
    title: "Mesin Brebet & Getar Saat AC Nyala",
    symptomCategory: "Sistem Pengapian & Beban Idle",
    faultComponent: "Busi Iridium Aus & Kebocoran Koil Silinder #2",
    code: "DTC P0302 - Cylinder 2 Misfire Detected",
    urgency: "PERIKSA SEGERA",
    urgencyBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    estimatedCost: "Rp 320.000 - Rp 650.000",
    diySteps: [
      "Buka cover mesin, lepas soket koil pengapian satu per satu saat mesin hidup untuk mengidentifikasi silinder yang pincang.",
      "Periksa warna ujung elektroda busi: jika hitam pekat berkerak, gap renggang > 1.2mm, ganti set busi baru.",
      "Cek selongsong karet koil dari retakan mikro kebocoran arus tegangan tinggi.",
    ],
  },
  {
    id: "bearing",
    title: "Bunyi Mendengung Kencang di Roda Depan (50-80 km/jam)",
    symptomCategory: "Kaki-Kaki & Drivetrain",
    faultComponent: "Front Wheel Hub Bearing Aus (Pelor Rontok)",
    code: "MECH-NVH-04 - Wheel Bearing Degradation",
    urgency: "KRITIS / BAHAYA",
    urgencyBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    estimatedCost: "Rp 450.000 - Rp 850.000",
    diySteps: [
      "Dongkrak roda depan, pegang per keong suspensi (coil spring) dengan tangan sambil memutar roda kencang.",
      "Jika ada getaran kasar merambat ke per keong, bearing positif aus dan got pelor tergerus.",
      "Goyang roda posisi jam 12 dan 6 untuk memastikan apakah as roda sudah oblak.",
    ],
  },
  {
    id: "extrafan",
    title: "AC Hembus Panas Saat Mobil Diam di Kemacetan",
    symptomCategory: "Sistem Pendinginan & Freon",
    faultComponent: "Motor Kipas Extra Fan Lemah / Switch Relay Macet",
    code: "COOL-SYS-02 - Radiator Sub-Fan Circuit Malfunction",
    urgency: "WASPADA OVERHEAT",
    urgencyBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    estimatedCost: "Rp 250.000 - Rp 1.100.000",
    diySteps: [
      "Buka kap mesin dalam posisi mesin hidup dan AC dinyalakan.",
      "Periksa putaran daun kipas extra fan: jika diam tidak berputar, ketuk rumah motor perlahan atau cek sekring sub-fan 30A.",
      "Hindari memaksakan AC tetap menyala saat macet jika extra fan mati untuk mencegah kompresor jebol dan mesin overheat.",
    ],
  },
];

export function DashboardPublicShowcase() {
  const { loginWithGoogle, loginAsGuest } = useAuth();

  // State Mobil Aktif & Odometer Simulator
  const [activeCarIndex, setActiveCarIndex] = useState(0);
  const activeCar = SHOWCASE_FLEET[activeCarIndex];
  const [odometerKm, setOdometerKm] = useState(activeCar.baseKm);
  const [activeDiagId, setActiveDiagId] = useState(INTERACTIVE_DIAGNOSTICS[0].id);
  const [quickQueryInput, setQuickQueryInput] = useState("");

  // Sync odometer saat ganti mobil
  const handleSelectVehicle = (idx: number) => {
    setActiveCarIndex(idx);
    setOdometerKm(SHOWCASE_FLEET[idx].baseKm);
  };

  // Kalkulasi Telemetri Real-Time
  const telemetry = useMemo(() => {
    // Siklus oli mesin tiap 5.000 KM
    const oilCycle = 5000;
    const oilPassed = odometerKm % oilCycle;
    const oilRemaining = Math.max(0, oilCycle - oilPassed);
    const oilHealth = Math.round((oilRemaining / oilCycle) * 100);

    // Siklus kampas rem tiap 20.000 KM
    const brakeCycle = 20000;
    const brakePassed = odometerKm % brakeCycle;
    const brakeRemaining = Math.max(0, brakeCycle - brakePassed);
    const brakeHealth = Math.round((brakeRemaining / brakeCycle) * 100);

    // Siklus cairan transmisi tiap 40.000 KM
    const transCycle = 40000;
    const transPassed = odometerKm % transCycle;
    const transRemaining = Math.max(0, transCycle - transPassed);
    const transHealth = Math.round((transRemaining / transCycle) * 100);

    // Indeks Kesiapan Unit (Weighted)
    const readinessScore = Math.round(oilHealth * 0.45 + brakeHealth * 0.35 + transHealth * 0.2);

    // Status Rekomendasi
    let statusText = "Kondisi Prima & Siap Jelajah";
    let statusColor = "text-emerald-500";
    if (oilRemaining <= 800 || brakeRemaining <= 2000) {
      statusText = "Jadwal Servis Berkala Mendekat";
      statusColor = "text-amber-500";
    }
    if (oilRemaining <= 200 || brakeRemaining <= 500) {
      statusText = "Perlu Penggantian Komponen Segera";
      statusColor = "text-rose-500";
    }

    // Kalkulasi RPM & Speedometer visual dial angle (0 to 180 deg)
    const speedRatio = Math.min(180, (odometerKm % 160) * 1.125);
    const rpmRatio = Math.min(180, (1000 + (odometerKm % 5000) * 0.8) / 33);

    return {
      oilHealth,
      oilRemaining,
      brakeHealth,
      brakeRemaining,
      transHealth,
      transRemaining,
      readinessScore,
      statusText,
      statusColor,
      speedRatio,
      rpmRatio,
    };
  }, [odometerKm]);

  const activeDiag =
    INTERACTIVE_DIAGNOSTICS.find((d) => d.id === activeDiagId) || INTERACTIVE_DIAGNOSTICS[0];

  return (
    <div className="pt-2 sm:pt-6 pb-24 max-w-7xl mx-auto space-y-24 sm:space-y-36">
      {/* =========================================================================
          1. REVOLUTIONARY SPLIT-SCREEN CYBER COCKPIT HERO
          (Linear / Tesla / Apple 2026 Automotive Tech Standard)
          ========================================================================= */}
      <section className="relative px-4 sm:px-6">
        {/* Ambient Top Light Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-blue-500/15 via-sky-400/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* KOLOM KIRI: Editorial Command Center */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Live Operational Status Capsule */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/90 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              <span>TORQ OS 3.0</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-sans font-semibold">Next-Gen Automotive Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
              Sistem Operasi{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 dark:from-blue-400 dark:via-sky-300 dark:to-blue-500">
                Kecerdasan Otomotif
              </span>{" "}
              di Saku Anda.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
              Platform lengkap pemilik mobil modern. Integrasikan telemetri servis berkala,
              ringkas 400 halaman buku manual pabrikan dengan AI, periksa komponen via{" "}
              <strong className="text-slate-900 dark:text-white font-bold">Augmented Reality 3D</strong>,
              serta lindungi transaksi beli mobil bekas dari penipuan.
            </p>

            {/* Interactive Live Prompt / Diagnostic Input Bar */}
            <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2 shadow-lg shadow-blue-500/5 backdrop-blur-md space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <input
                  type="text"
                  value={quickQueryInput}
                  onChange={(e) => setQuickQueryInput(e.target.value)}
                  placeholder="Ketik keluhan mobil (misal: mesin getar, rem bunyi) atau link FB..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                />
                <Link
                  href={quickQueryInput.trim() ? `/diagnose?q=${encodeURIComponent(quickQueryInput)}` : "/diagnose"}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>Tanya AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-1.5 px-2 pb-1 overflow-x-auto no-scrollbar text-[11px]">
                <span className="text-slate-400 dark:text-slate-500 font-mono shrink-0">Coba:</span>
                {[
                  "Rem Berdecit",
                  "Mesin Brebet AC Nyala",
                  "Oli Avanza Veloz",
                  "Cek Link Marketplace",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setQuickQueryInput(chip)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct CTA Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full sm:w-auto min-h-[50px] px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
              >
                <span>Mulai Gratis dengan Google</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={loginAsGuest}
                className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Mode Tamu (Tanpa Login)</span>
              </button>
            </div>

            {/* Metrics Strip */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                  12.500+
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Armada Terpantau</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-sky-400 font-mono">
                  99.4%
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Akurasi Diagnosa AI</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  OWASP
                </div>
                <div className="text-[11px] text-slate-500 font-medium">ASI-2026 Bersertifikat</div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: THE INTERACTIVE CYBER COCKPIT HUD STAGE */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-[2.5rem] bg-slate-950 text-white border border-slate-800/90 p-6 sm:p-7 shadow-2xl shadow-blue-500/10 relative overflow-hidden">
              {/* Cockpit Header: Car Switcher & Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
                      LIVE HUD TELEMETRY
                    </span>
                    <h3 className="text-sm font-black text-white">
                      {activeCar.brand} {activeCar.model}
                    </h3>
                  </div>
                </div>

                {/* Fleet Switcher Pills */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {SHOWCASE_FLEET.map((car, idx) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => handleSelectVehicle(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeCarIndex === idx
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {car.id.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* TWIN DIGITAL GAUGES (SPEEDOMETER & TACHOMETER HUD) */}
              <div className="grid grid-cols-2 gap-4 py-6 border-b border-slate-800/80 text-center">
                {/* Gauge Kiri: Tachometer RPM */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    ENGINE RPM
                  </span>
                  <div className="relative w-28 h-20 flex items-center justify-center">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#2563eb"
                        strokeWidth="8"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * telemetry.readinessScore) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                      <span className="text-2xl font-black font-mono text-white tracking-tight">
                        {telemetry.readinessScore}%
                      </span>
                      <span className="text-[9px] font-mono text-blue-400 font-bold uppercase">
                        KESIAPAN
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gauge Kanan: Odometer Counter & Status */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider self-start mb-1">
                    ODOMETER AKTIF
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-sky-400 tracking-tight my-auto">
                    {odometerKm.toLocaleString("id-ID")}
                    <span className="text-xs text-slate-400 font-sans ml-1">KM</span>
                  </div>
                  <div className="w-full mt-2">
                    <div className={`text-xs font-bold ${telemetry.statusColor} flex items-center gap-1.5`}>
                      <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                      <span className="truncate">{telemetry.statusText}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE ODOMETER THROTTLE SLIDER */}
              <div className="py-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                    <span>UJI RESPON KILOMETER:</span>
                  </span>
                  <span className="text-blue-400 font-bold">
                    GESER UNTUK MENSIMULASIKAN KEUSAN
                  </span>
                </div>

                <input
                  type="range"
                  min="5000"
                  max="180000"
                  step="500"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>5.000 KM (Baru)</span>
                  <span>40.000 KM (Servis Besar)</span>
                  <span>180.000 KM (Tinggi)</span>
                </div>
              </div>

              {/* 3 LIVE COMPONENT TELEMETRY BARS */}
              <div className="space-y-3 pt-2">
                {/* Oli Mesin */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-slate-200">Pelumasan Oli ({activeCar.oilSpec})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">
                      Sisa ~{telemetry.oilRemaining.toLocaleString("id-ID")} KM
                    </span>
                    <span className="font-mono font-bold text-blue-400 w-10 text-right">
                      {telemetry.oilHealth}%
                    </span>
                  </div>
                </div>

                {/* Kampas Rem */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-200">Kampas Rem & Piringan Cakram</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">
                      Sisa ~{telemetry.brakeRemaining.toLocaleString("id-ID")} KM
                    </span>
                    <span className="font-mono font-bold text-emerald-400 w-10 text-right">
                      {telemetry.brakeHealth}%
                    </span>
                  </div>
                </div>

                {/* Transmisi & Fluida */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span className="font-bold text-slate-200">Transmisi ({activeCar.transType})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">
                      Sisa ~{telemetry.transRemaining.toLocaleString("id-ID")} KM
                    </span>
                    <span className="font-mono font-bold text-sky-400 w-10 text-right">
                      {telemetry.transHealth}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Cockpit Footer Action */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Plat Terdaftar: <strong>{activeCar.plate}</strong>
                </span>
                <Link
                  href="/garage"
                  className="px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Buka Garasi Penuh</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. THE "LIVE AI MECHANIC LAB" INTERACTIVE DIAGNOSTIC BENCH
          ========================================================================= */}
      <section className="px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
            <Bot className="w-3.5 h-3.5" />
            <span>INTERACTIVE AI DIAGNOSTIC TRIAGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Uji Coba Langsung Cara TORQ AI Membedah Masalah
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal">
            Pilih salah satu keluhan nyata pemilik mobil di bawah. Lihat bagaimana mesin AI memetakan
            komponen rusak, kode DTC, estimasi biaya wajar, dan langkah cek mandiri (DIY).
          </p>
        </div>

        {/* Diagnostic Workbench Panel */}
        <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xl shadow-blue-500/5">
          {/* 3 Symptom Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {INTERACTIVE_DIAGNOSTICS.map((diag) => {
              const isSelected = diag.id === activeDiagId;
              return (
                <button
                  key={diag.id}
                  type="button"
                  onClick={() => setActiveDiagId(diag.id)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    {diag.symptomCategory}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {diag.title}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Active Diagnostic Detail Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Analisa & Estimasi Biaya */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border uppercase ${activeDiag.urgencyBg}`}>
                    {activeDiag.urgency}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    {activeDiag.code}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Komponen Yang Dicurigai:</span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {activeDiag.faultComponent}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Estimasi Biaya Wajar:</span>
                    <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {activeDiag.estimatedCost}
                    </span>
                  </div>
                  <Link
                    href={`/spareparts?q=${encodeURIComponent(activeDiag.faultComponent.split(" ")[0])}`}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>Cari Part</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Semua analisa diverifikasi berdasarkan database mekanikal OEM dan referensi bengkel resmi untuk mencegah praktik penggelembungan biaya (mark-up).
                </p>
              </div>
            </div>

            {/* Checklist DIY Mandiri */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Panduan Pengecekan Mandiri di Rumah (DIY):</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">3 Langkah Kunci</span>
              </div>

              <div className="space-y-3">
                {activeDiag.diySteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    <span className="h-6 w-6 rounded-lg bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href="/diagnose"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Konsultasikan Masalah Lain di TORQ AI Studio</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HIGH-TECH BENTO ARCHITECTURE 2.0 (4 PILLARS REDESIGNED)
          ========================================================================= */}
      <section className="px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>ARSITEKTUR FITUR UTAMA BENGKELSAKU</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Ekosistem Perlindungan Kendaraan 360°
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Dirancang dari nol untuk menjawab kebutuhan riil pemilik mobil di Indonesia.
          </p>
        </div>

        {/* 4-Tile Modern Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tile 1 (Span 7 col): AR Visual 3D Spatial Inspector */}
          <div className="md:col-span-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Crosshair className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                  Spatial AR 3D
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Inspeksi Visual Ruang Mesin & Kaki-kaki
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                  Foto langsung ruang mesin Anda dari kamera ponsel. AI memetakan letak sensor,
                  tabung master rem, alternator, dan filter dengan pin interaktif bernomor
                  sehingga Anda tahu persis komponen apa yang sedang diperiksa.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">4 Sudut Pandang Tersedia</span>
              <Link
                href="/ar-inspector"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Buka AR Inspector</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tile 2 (Span 5 col): Kompresi Manual PDF */}
          <div className="md:col-span-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                  Hemat 95% Token
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Kompresi Manual Book PDF ke AI
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                  Unggah file buku panduan mobil Anda. AI mengekstrak takaran oli, torsi baut,
                  dan kode busi pabrikan agar selalu diingat oleh asisten TORQ AI.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Ekstraksi Sekali, Aktif Selamanya</span>
              <Link
                href="/garage"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Kelola Garasi</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tile 3 (Span 5 col): Marketplace Scraper & Anti-Tipu */}
          <div className="md:col-span-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                  FB & OLX Scraper
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Inspeksi Mobil Bekas Anti-Tipu
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                  Salin link iklan mobil incaran, bawa checklist 20 titik validasi ke lokasi pertemuan (COD)
                  untuk mendeteksi jejak banjir dan bekas tabrakan frontal.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Checklist Lapangan Interaktif</span>
              <Link
                href="/inspection"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Mulai Inspeksi</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Tile 4 (Span 7 col): Transparansi Biaya & Katalog Part */}
          <div className="md:col-span-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:border-blue-400 dark:hover:border-blue-500/40 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                  Bebas Mark-Up
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Katalog Suku Cadang & Estimasi Biaya Riil
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                  Ketahui harga suku cadang OEM/aftermarket resmi sebelum melangkah ke bengkel.
                  Terhubung langsung dengan Tokopedia & Shopee untuk part yang dijamin cocok.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Perbandingan Bengkel Spesialis vs ATPM</span>
              <Link
                href="/spareparts"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat Katalog Part</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FINAL CONVERSION BANNER (PURE BLUE & WHITE GRADIENT)
          ========================================================================= */}
      <section className="px-4 sm:px-6">
        <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 p-8 sm:p-12 text-white shadow-2xl shadow-blue-600/20 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 text-center lg:text-left max-w-2xl relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider">
              GRATIS 100% UNTUK PEMILIK MOBIL
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Siap Rawat Mobil Anda Secara Cerdas?
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Daftarkan mobil pertama Anda dalam 60 detik. Pantau jadwal ganti oli,
              deteksi kerusakan dini, dan hindari pengeluaran bengkel yang sia-sia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 bg-white text-blue-600 hover:bg-blue-50 font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Masuk dengan Google
            </button>
            <Link
              href="/signin"
              className="w-full sm:w-auto min-h-[50px] px-6 py-3.5 bg-blue-950/40 hover:bg-blue-950/60 text-white font-bold text-sm rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Daftar dengan Email</span>
            </Link>
          </div>

          {/* Ambient Glow */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
