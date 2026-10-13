"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Wrench,
  Sparkles,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LogIn,
  Filter,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

const SERVICE_CALCULATOR_PRESETS = [
  {
    km: 10000,
    title: "10.000 KM • Servis Ringan Rutin",
    urgency: "NORMAL",
    items: [
      { name: "Oli Mesin Fully Synthetic (4 Liter)", estCost: "Rp 320.000 - Rp 450.000" },
      { name: "Filter Oli OEM", estCost: "Rp 35.000 - Rp 55.000" },
      { name: "Pembersihan Filter Udara & AC", estCost: "Rp 0 (Termasuk servis)" },
      { name: "General Check 20 Titik (Rem, Aki, Cairan)", estCost: "Rp 100.000 - Rp 150.000" },
    ],
    totalOfficial: "Rp 700.000 - Rp 950.000",
    totalSpecialist: "Rp 450.000 - Rp 650.000",
    safetyTip: "Ganti oli mesin secara teratur adalah investasi terpenting untuk mencegah sludge (lumpur oli) yang merusak silinder mesin.",
  },
  {
    km: 40000,
    title: "40.000 KM • Servis Mayor (Besar) Berkala",
    urgency: "PENTING",
    items: [
      { name: "Oli Mesin + Filter Oli Baru", estCost: "Rp 380.000 - Rp 500.000" },
      { name: "Kuras Minyak Rem (DOT 3 / DOT 4)", estCost: "Rp 90.000 - Rp 150.000" },
      { name: "Penggantian Filter Udara & Filter Kabin", estCost: "Rp 120.000 - Rp 180.000" },
      { name: "Kuras Cairan Radiator Coolant 50/50", estCost: "Rp 110.000 - Rp 160.000" },
      { name: "Ganti Busi Standar (4 Pcs)", estCost: "Rp 100.000 - Rp 160.000" },
    ],
    totalOfficial: "Rp 1.400.000 - Rp 2.100.000",
    totalSpecialist: "Rp 900.000 - Rp 1.300.000",
    safetyTip: "Minyak rem yang tidak dikuras lebih dari 2 tahun akan menyerap uap air (hygroscopic) dan dapat menyebabkan rem blong akibat gelembung uap air saat rem panas.",
  },
  {
    km: 80000,
    title: "80.000 KM • Kuras Transmisi & Rotasi Total",
    urgency: "KRITIS",
    items: [
      { name: "Kuras Oli Transmisi Matic (ATF / CVT Fluid)", estCost: "Rp 450.000 - Rp 800.000" },
      { name: "Tune Up Carbon Cleaner & Throttle Body", estCost: "Rp 250.000 - Rp 350.000" },
      { name: "Pemeriksaan / Ganti Kampas Rem Depan", estCost: "Rp 250.000 - Rp 450.000" },
      { name: "Pemeriksaan V-Belt / Drive Belt Alternator", estCost: "Rp 120.000 - Rp 200.000" },
    ],
    totalOfficial: "Rp 2.200.000 - Rp 3.400.000",
    totalSpecialist: "Rp 1.400.000 - Rp 2.100.000",
    safetyTip: "Untuk transmisi CVT (seperti Honda Brio/Jazz, Toyota Calya), telat kuras oli transmisi bisa berakibat jebolnya sabuk baja CVT dengan biaya perbaikan belasan juta rupiah.",
  },
];

export function MaintenancePublicShowcase() {
  const { loginWithGoogle } = useAuth();
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const activePreset = SERVICE_CALCULATOR_PRESETS[selectedPresetIndex];

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* 1. Hero Promotional Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-10 border border-blue-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>BUKU SERVIS DIGITAL & ESTIMATOR BIAYA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Lupakan Struk Kertas Bengkel.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-200">
              Rekam Jejak Servis & Prediksi Biaya
            </span>{" "}
            dengan Presisi.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Ketahui estimasi harga suku cadang dan ongkos jasa montir sebelum Anda melangkah ke bengkel.
            Cegah praktik mark-up (ketok harga), terima alarm jadwal servis otomatis tiap 5.000 KM, dan
            dongkrak harga jual kembali mobil Anda dengan sertifikat rekam jejak digital.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center gap-2.5 shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Mulai Catat Servis Mobil Saya (Gratis)</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link
              href="/signin"
              className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm flex items-center gap-2 transition-all"
            >
              <span>Masuk Akun</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Estimasi Biaya Transparan (IDR)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Tersimpan di Cloud PostgreSQL Aman</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Tingkatkan Resale Value Mobil s/d 15%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Maintenance Cost Simulator */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <DollarSign className="h-4 w-4" />
              <span>Simulasi Interaktif Estimasi Biaya</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Berapa Biaya Servis Mobil yang Wajar?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Pilih interval kilometer di bawah untuk melihat rincian suku cadang resmi dan perbandingan
              biaya antara bengkel resmi vs bengkel spesialis:
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
            {SERVICE_CALCULATOR_PRESETS.map((preset, idx) => (
              <button
                key={preset.km}
                type="button"
                onClick={() => setSelectedPresetIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  selectedPresetIndex === idx
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {preset.km.toLocaleString("id-ID")} KM
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulator Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Simulasi Rekomendasi Servis
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {activePreset.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Tingkat Urgensi: {activePreset.urgency}
              </span>
            </div>
          </div>

          {/* Parts List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Daftar Komponen & Tindakan Pemeliharaan:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePreset.items.map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400 shrink-0">
                    {item.estCost}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Comparison Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200/60 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Estimasi Total di Bengkel Spesialis Mandiri:
              </span>
              <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {activePreset.totalSpecialist}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Termasuk part aftermarket berkualitas & ongkos montir
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-slate-800 dark:to-slate-800/80 border border-emerald-200/60 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Estimasi Total di Bengkel Resmi ATPM:
              </span>
              <p className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                {activePreset.totalOfficial}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Standar part OEM resmi & jasa teknisi bersertifikat
              </p>
            </div>
          </div>

          {/* Mechanical Safety Guide Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-800 dark:text-slate-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-black text-amber-700 dark:text-amber-400">
                Catatan Mekanikal & Keselamatan Penting:
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {activePreset.safetyTip}
              </p>
            </div>
          </div>

          {/* CTA Trigger */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Simpan catatan servis Anda untuk kalkulasi akurat pada kilometer berjalan.</span>
            </div>

            <button
              type="button"
              onClick={loginWithGoogle}
              className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Daftar & Rekam Servis Mobil Anda Sekarang</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Three Resale Value Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Harga Jual Mobil Naik 10-15%
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Pembeli mobil bekas berani membayar lebih tinggi saat melihat riwayat perawatan berkala
            yang terdokumentasi rapi tanpa putus sejak kilometer awal.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-xs">
            <DollarSign className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Bebas Praktik Ketok Harga
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Bandingkan nota bengkel dengan database standar BengkelSaku. Anda tahu persis berapa biaya
            jasa pasang dan harga suku cadang wajar sebelum menyetujui pengerjaan.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800 shadow-xs">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Alarm Servis Berbasis Kilometer
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Dapatkan peringatan tepat waktu saat mobil Anda mendekati ambang batas kilometer ganti oli
            mesin, kuras minyak rem, atau penggantian sabuk transmisi.
          </p>
        </div>
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 p-8 sm:p-10 text-white shadow-xl shadow-blue-600/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-2xl font-black text-white tracking-tight">
            Mulai Buku Servis Digital Pertama Anda
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg">
            Simpan bukti servis, catat pergantian oli, dan miliki catatan perawatan mobil paling rapi di Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={loginWithGoogle}
            className="min-h-[46px] px-6 py-2.5 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            Masuk dengan Google
          </button>
          <Link
            href="/signin"
            className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-blue-950/40 hover:bg-blue-950/60 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-1.5"
          >
            <span>Daftar Email</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

