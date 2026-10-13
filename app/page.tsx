"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Vehicle } from "@/types/automotive";
import {
  Wrench,
  Sparkles,
  ShieldCheck,
  Plus,
  Send,
  AlertTriangle,
  Car,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Activity,
  Gauge,
  Calendar,
  DollarSign,
  Search,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Zap,
  RotateCcw,
  Camera,
} from "lucide-react";
import { DiagnosticResponse } from "@/types/agent";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getStoredVehicles,
  saveStoredVehicle,
  updateStoredVehicleOdometer,
} from "@/lib/storage/user-data";
import { DashboardPublicShowcase } from "@/components/showcase/DashboardPublicShowcase";

export default function DashboardPage() {
  const { user } = useAuth();
  const userKey = user?.email || "default_user";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [complaintInput, setComplaintInput] = useState("");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosticResponse | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);

  // Quick Odometer inline editor
  const [isEditingKm, setIsEditingKm] = useState(false);
  const [newOdoInput, setNewOdoInput] = useState("");

  // Load vehicles from storage
  useEffect(() => {
    const loaded = getStoredVehicles(userKey);
    setVehicles(loaded);
    if (loaded.length > 0) {
      setSelectedVehicle(loaded[0]);
      setNewOdoInput(loaded[0].currentOdometer.toString());
    }

    // Auto-update photo if car uses generic Unsplash photo
    loaded.forEach(async (v) => {
      if (!v.imageUrl || v.imageUrl.includes("unsplash.com")) {
        try {
          const res = await fetch(
            `/api/car-image?make=${encodeURIComponent(v.make)}&model=${encodeURIComponent(
              v.model
            )}&year=${v.year}`
          );
          const data = await res.json();
          if (data.imageUrl && !data.imageUrl.includes("unsplash.com")) {
            const current = getStoredVehicles(userKey);
            const updated = current.map((item) =>
              item.id === v.id ? { ...item, imageUrl: data.imageUrl } : item
            );
            localStorage.setItem(
              `bengkelsaku_user_vehicles_${userKey}`,
              JSON.stringify(updated)
            );
            setVehicles(updated);
            if (selectedVehicle?.id === v.id) {
              setSelectedVehicle({ ...selectedVehicle, imageUrl: data.imageUrl });
            }
          }
        } catch (err) {
          console.warn("Gagal auto-update foto mobil:", err);
        }
      }
    });
  }, [userKey]);

  // Handle active vehicle switch
  const handleSelectCar = (veh: Vehicle) => {
    setSelectedVehicle(veh);
    setNewOdoInput(veh.currentOdometer.toString());
    setDiagnosisResult(null);
    setDiagError(null);
  };

  // Quick update odometer from dashboard
  const handleSaveOdo = () => {
    if (!selectedVehicle) return;
    const km = Number(newOdoInput);
    if (isNaN(km) || km < 0) return;

    const updatedList = updateStoredVehicleOdometer(selectedVehicle.id, km, userKey);
    setVehicles(updatedList);
    const updatedVeh = updatedList.find((v) => v.id === selectedVehicle.id);
    if (updatedVeh) setSelectedVehicle(updatedVeh);
    setIsEditingKm(false);
  };

  // Dynamic Telemetry Calculations based on active car's odometer
  const telemetry = useMemo(() => {
    if (!selectedVehicle) {
      return {
        oilHealth: 85,
        oilRemainingKm: 3400,
        brakeHealth: 75,
        brakeRemainingKm: 12000,
        filterHealth: 60,
        filterRemainingKm: 4500,
        coolantHealth: 90,
        coolantRemainingKm: 25000,
        overallReadiness: 88,
        urgencyCount: 0,
        estimatedCost: "Rp 320.000",
      };
    }

    const odo = selectedVehicle.currentOdometer || 30000;

    // Oil cycle: 5,000 km
    const oilCycle = 5000;
    const oilInto = odo % oilCycle;
    const oilRemainingKm = Math.max(0, oilCycle - oilInto);
    const oilHealth = Math.round((oilRemainingKm / oilCycle) * 100);

    // Brake cycle: 20,000 km
    const brakeCycle = 20000;
    const brakeInto = odo % brakeCycle;
    const brakeRemainingKm = Math.max(0, brakeCycle - brakeInto);
    const brakeHealth = Math.round((brakeRemainingKm / brakeCycle) * 100);

    // Air filter cycle: 15,000 km
    const filterCycle = 15000;
    const filterInto = odo % filterCycle;
    const filterRemainingKm = Math.max(0, filterCycle - filterInto);
    const filterHealth = Math.round((filterRemainingKm / filterCycle) * 100);

    // Coolant cycle: 40,000 km
    const coolantCycle = 40000;
    const coolantInto = odo % coolantCycle;
    const coolantRemainingKm = Math.max(0, coolantCycle - coolantInto);
    const coolantHealth = Math.round((coolantRemainingKm / coolantCycle) * 100);

    const overallReadiness = Math.round(
      oilHealth * 0.35 + brakeHealth * 0.35 + filterHealth * 0.15 + coolantHealth * 0.15
    );

    let urgencyCount = 0;
    if (oilHealth < 25) urgencyCount++;
    if (brakeHealth < 25) urgencyCount++;
    if (filterHealth < 25) urgencyCount++;
    if (coolantHealth < 25) urgencyCount++;

    const isAtoz = `${selectedVehicle.make} ${selectedVehicle.model}`.toLowerCase().includes("atoz");
    const estimatedCost = isAtoz ? "Rp 280.000 - 380.000" : "Rp 350.000 - 550.000";

    return {
      oilHealth,
      oilRemainingKm,
      brakeHealth,
      brakeRemainingKm,
      filterHealth,
      filterRemainingKm,
      coolantHealth,
      coolantRemainingKm,
      overallReadiness,
      urgencyCount,
      estimatedCost,
    };
  }, [selectedVehicle]);

  // Fast Diagnostic Execution
  const handleRunDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintInput.trim()) return;

    setIsDiagnosing(true);
    setDiagError(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintText: complaintInput,
          vehicleId: selectedVehicle?.id || "quick-diag",
          userId: user?.id || "guest",
          vehicleContext: selectedVehicle
            ? {
                make: selectedVehicle.make,
                model: selectedVehicle.model,
                year: selectedVehicle.year,
                odometer: selectedVehicle.currentOdometer,
                manualGuideText: selectedVehicle.manualGuideText,
                manualFileName: selectedVehicle.manualFileName,
              }
            : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menganalisa keluhan mobil.");
      }

      setDiagnosisResult(data);
    } catch (err: any) {
      setDiagError(err.message || "Koneksi terputus ke asisten AI.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  // If visitor is not logged in, show the World-Class Interactive Showcase
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-4 sm:p-6 pb-28 max-w-7xl mx-auto transition-colors">
        <DashboardPublicShowcase />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 pb-28 transition-colors">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-7">
        {/* =========================================================================
            1. EXECUTIVE TELEMETRY COMMAND BANNER
            ========================================================================= */}
        <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 text-white p-6 sm:p-8 lg:p-10 shadow-2xl shadow-blue-600/20 relative overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Gauge className="w-64 h-64" />
          </div>
          <div className="absolute top-0 right-1/3 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 border border-white/30 backdrop-blur-md text-white">
                  Executive Telemetry Hub
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Live Monitoring Aktif
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Halo, {user.name} 👋
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed font-normal">
                Pusat pemantauan performa kendaraan, siklus keausan fluida mekanikal, serta konsultasi diagnosa pintar dengan Master Mechanic TORQ AI.
              </p>
            </div>

            {/* Quick Vehicle Switcher / Selector HUD */}
            {vehicles.length > 0 ? (
              <div className="flex items-center gap-4 bg-slate-950/40 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-lg shrink-0">
                {selectedVehicle?.imageUrl && (
                  <div className="relative h-14 w-16 rounded-2xl overflow-hidden bg-white/10 shrink-0 border border-white/30">
                    <Image
                      src={selectedVehicle.imageUrl}
                      alt={selectedVehicle.model}
                      fill
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                    Unit Aktif:
                  </div>
                  <select
                    aria-label="Pilih kendaraan aktif"
                    value={selectedVehicle?.id || ""}
                    onChange={(e) => {
                      const found = vehicles.find((v) => v.id === e.target.value);
                      if (found) handleSelectCar(found);
                    }}
                    className="bg-transparent font-black text-white text-sm focus:outline-none cursor-pointer"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id} className="text-slate-900 bg-white">
                        {v.make} {v.model} ({v.year})
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-white/90 font-mono mt-0.5">
                    {selectedVehicle?.licensePlate || "Tanpa Plat"} •{" "}
                    {(selectedVehicle?.currentOdometer || 0).toLocaleString("id-ID")} KM
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/garage"
                className="px-6 py-3.5 rounded-2xl bg-white text-blue-600 text-xs font-black shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 shrink-0 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Daftarkan Mobil Pertama</span>
              </Link>
            )}
          </div>
        </div>

        {/* =========================================================================
            2. 4 EXECUTIVE KPI CARDS (Linear & Apple Aesthetic)
            ========================================================================= */}
        <section aria-label="Ringkasan Performa Armada" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Indeks Kesiapan Unit */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Indeks Kesiapan Unit
              </span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {telemetry.overallReadiness}%
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                {telemetry.overallReadiness >= 80 ? "Kondisi Prima (Siap Luar Kota)" : "Butuh Perhatian"}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${telemetry.overallReadiness}%` }}
              />
            </div>
          </div>

          {/* KPI 2: Servis Terdekat */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Servis Terdekat
              </span>
              <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                Ganti Oli Mesin
              </div>
              <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                Sisa ~{telemetry.oilRemainingKm.toLocaleString("id-ID")} KM
              </p>
            </div>
            <div className="text-[10px] text-slate-400">
              Interval ganti tiap 5.000 KM
            </div>
          </div>

          {/* KPI 3: Estimasi Biaya Servis */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Estimasi Biaya Servis
              </span>
              <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">
                {telemetry.estimatedCost}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                Oli 4L + Filter Ori OEM
              </span>
            </div>
            <Link
              href="/spareparts"
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Lihat Suku Cadang</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* KPI 4: Armada Terpantau */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Armada Terpantau
              </span>
              <div className="h-8 w-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Car className="h-4 w-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {vehicles.length} Unit
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                Garasi Digital Anda
              </span>
            </div>
            <Link
              href="/garage"
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Buka Garasi Lengkap</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* =========================================================================
            3. PUSAT AKSI & FITUR UTAMA (4 Bento Navigation Tiles)
            ========================================================================= */}
        <section aria-label="Aksi Cepat Fitur Utama" className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pusat Aksi & Fitur Utama
            </h2>
            <span className="text-xs text-slate-400">Direct Navigation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Inspeksi Mobil */}
            <Link
              href="/inspection"
              className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Inspeksi Mobil Bekas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Checklist 25 titik TKP, deteksi klaim palsu penjual, dan estimasi biaya perbaikan.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Mulai Inspeksi TKP</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tile 2: Diagnosa Keluhan */}
            <Link
              href="/diagnose"
              className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Konsultasi TORQ AI
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Analisa bunyi mesin, indikator check engine, dan panduan DIY mekanik mandiri.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Chat Asisten Mekanik</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tile 3: Katalog Suku Cadang */}
            <Link
              href="/spareparts"
              className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 shadow-xs hover:shadow-xl hover:shadow-teal-500/10 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-xs">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    Katalog Suku Cadang
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Suku cadang OEM terverifikasi sesuai model mobil Anda dengan direct beli Tokopedia/Shopee.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>Buka Katalog Sparepart</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tile 4: Garasi & AR Inspector */}
            <Link
              href="/ar-inspector"
              className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-xs hover:shadow-xl hover:shadow-purple-500/10 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Visual AR Ruang Mesin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Eksplorasi sensor dan komponen ruang mesin dengan pin visual hotspot interaktif 3D.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>Eksplorasi Visual AR</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            4. SECTION: TELEMETRI SIKLUS AUS KOMPONEN UNIT AKTIF
            ========================================================================= */}
        {selectedVehicle && (
          <section className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                  <span>Telemetri & Estimasi Masa Pakai Komponen</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dihitung otomatis berdasarkan odometer aktif {selectedVehicle.make} {selectedVehicle.model} (
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {selectedVehicle.currentOdometer.toLocaleString("id-ID")} KM
                  </strong>
                  )
                </p>
              </div>

              {/* Inline Quick Odometer Editor */}
              <div className="flex items-center gap-2">
                {isEditingKm ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newOdoInput}
                      onChange={(e) => setNewOdoInput(e.target.value)}
                      aria-label="Kilometer baru"
                      className="w-28 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveOdo}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingKm(false)}
                      className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingKm(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <Gauge className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Perbarui Angka KM</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4 Telemetry Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gauge 1: Oli Mesin */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    Pelumasan Oli Mesin
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Sisa ~{telemetry.oilRemainingKm.toLocaleString("id-ID")} KM ({telemetry.oilHealth}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      telemetry.oilHealth > 40
                        ? "bg-blue-600"
                        : telemetry.oilHealth > 15
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${telemetry.oilHealth}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rekomendasi: Ganti bersama filter oli tiap 5.000 KM agar ruang bakar bebas sludge.
                </p>
              </div>

              {/* Gauge 2: Kampas Rem */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Kampas Rem & Cakram Depan
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Sisa ~{telemetry.brakeRemainingKm.toLocaleString("id-ID")} KM ({telemetry.brakeHealth}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${telemetry.brakeHealth}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Periksa ketebalan kampas rem tiap 20.000 KM. Pastikan minyak rem di batas MAX.
                </p>
              </div>

              {/* Gauge 3: Filter Udara */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    Saringan Udara & Busi Pengapian
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Sisa ~{telemetry.filterRemainingKm.toLocaleString("id-ID")} KM ({telemetry.filterHealth}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${telemetry.filterHealth}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Bersihkan filter udara tiap 5.000 KM dan ganti busi tembaga reguler tiap 20.000 KM.
                </p>
              </div>

              {/* Gauge 4: Radiator Coolant */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                    Sistem Pendingin & Cairan Hidrolik
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Sisa ~{telemetry.coolantRemainingKm.toLocaleString("id-ID")} KM ({telemetry.coolantHealth}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${telemetry.coolantHealth}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kuras radiator coolant tiap 40.000 KM. Jangan campur air sumur untuk mencegah kerak.
                </p>
              </div>
            </div>

            {/* AI Knowledge Profile Callout */}
            {selectedVehicle.manualGuideText && (
              <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 flex items-start gap-3.5 text-xs">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-blue-950 dark:text-blue-200">
                    Buku Manual Terkompresi Bahasa AI Aktif: {selectedVehicle.manualFileName || "Manual Kendaraan"}
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed font-mono line-clamp-2">
                    {selectedVehicle.manualGuideText}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            5. TORQ AI FAST DIAGNOSTIC TERMINAL
            ========================================================================= */}
        <section
          id="diagnostic-panel"
          aria-labelledby="diagnose-heading"
          className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 id="diagnose-heading" className="text-base font-black text-slate-900 dark:text-white">
                  Diagnosa Instan TORQ AI Otomotif
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedVehicle
                    ? `Fokus unit: ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.licensePlate || "Tanpa Plat"})`
                    : "Ketik gejala atau bunyi janggal yang Anda rasakan pada mobil"}
                </p>
              </div>
            </div>

            <Link
              href="/diagnose"
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Chatbot Penuh</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <form onSubmit={handleRunDiagnosis} className="space-y-3">
            <div>
              <label htmlFor="complaint-input" className="sr-only">
                Deskripsi Gejala Kerusakan
              </label>
              <textarea
                id="complaint-input"
                rows={3}
                value={complaintInput}
                onChange={(e) => setComplaintInput(e.target.value)}
                placeholder="Contoh: Bunyi jedug jedug di ban depan kanan saat lewat jalan jelek, atau mesin agak ndut-ndutan pas AC nyala..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <span className="text-[10px] text-slate-400 shrink-0 font-medium">Contoh Keluhan:</span>
                {[
                  "Bunyi jedug di setir",
                  "Rem bunyi decit",
                  "Mesin brebet pas stasioner",
                  "Temperatur naik pas macet",
                ].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setComplaintInput(quick)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 whitespace-nowrap transition-colors"
                  >
                    {quick}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isDiagnosing || !complaintInput.trim()}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isDiagnosing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Menganalisa...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Analisa Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Diagnosis Result View */}
          {diagError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{diagError}</span>
            </div>
          )}

          {diagnosisResult && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Hasil Analisa Cepat:
                </span>
                <span className="text-xs font-bold text-blue-600">Tingkat: {diagnosisResult.severity}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {diagnosisResult.analysisSummary}
              </p>
              <div className="flex items-center justify-end">
                <Link
                  href="/diagnose"
                  className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Buka Dialog Penuh di TORQ AI Chat</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
