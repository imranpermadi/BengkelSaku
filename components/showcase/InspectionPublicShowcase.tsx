"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  ExternalLink,
  CheckCircle2,
  Car,
  Zap,
  PlayCircle,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

const DEMO_SCRAPED_LISTINGS = [
  {
    id: "demo-atoz",
    name: "Hyundai Atoz",
    title: "Hyundai Atoz 1.0 GLS Manual 2002 Orisinil",
    price: "Rp 38.000.000",
    url: "https://www.facebook.com/marketplace/item/966987856212792/",
    platform: "Facebook Marketplace",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Hyundai_Atos_1.0_GL_2000.jpg/1280px-Hyundai_Atos_1.0_GL_2000.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    claims: [
      {
        id: 1,
        title: "Mesin Halus & Kering, No Rembes Oli",
        tip: "Periksa paking carter oli dan tutup klep silinder mesin. Bawa senter, raba bawah mesin dengan tisu putih saat dingin.",
      },
      {
        id: 2,
        title: "Bebas Banjir & Bebas Bekas Tabrakan Parah",
        tip: "Buka karet lis pintu pilar A, B, C untuk cek keutuhan titik las pabrik (spot welding). Cek aroma apek di bawah karpet.",
      },
      {
        id: 3,
        title: "AC Dingin Menggigil, Kompresor Normal",
        tip: "Nyalakan AC kecepatan maksimal saat posisi idle. Rasakan apakah tarikan mesin ngedrop parah atau ada suara mendengung.",
      },
      {
        id: 4,
        title: "Surat Lengkap BPKB STNK Faktur Akur",
        tip: "Cek fisik nomor rangka di bodi & nomor mesin di blok mesin. Wajib sinkron huruf demi huruf dengan BPKB asli.",
      },
    ],
  },
  {
    id: "demo-avanza",
    name: "Toyota Avanza",
    title: "Toyota Avanza 1.3 G Manual 2018 Hitam Metalik",
    price: "Rp 138.000.000",
    url: "https://www.facebook.com/marketplace/item/184920491823481/",
    platform: "Facebook Marketplace",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
    claims: [
      {
        id: 1,
        title: "Tangan Pertama dari Baru, Service Record Resmi",
        tip: "Minta tunjukkan buku servis resmi dan kartu riwayat ganti oli berkala dari bengkel resmi.",
      },
      {
        id: 2,
        title: "Bodi Full Kaleng Bebas Tabrak",
        tip: "Ketuk bodi di sekitar fender dan kap mesin untuk membedakan suara dempulan tebal vs pelat kaleng asli.",
      },
      {
        id: 3,
        title: "Kilometer Asli Rendah 65.000 KM",
        tip: "Cek keausan pedal rem/gas, lingkar setir, dan tuas transmisi apakah sinkron dengan angka odometer.",
      },
      {
        id: 4,
        title: "Kaki-Kaki Senyap Bebas Bunyi",
        tip: "Uji jalan belok patah di jalan paving block, dengarkan apakah ada bunyi kletek-kletek CV joint atau rack steer.",
      },
    ],
  },
];

export function InspectionPublicShowcase() {
  const { loginWithGoogle } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeListing = DEMO_SCRAPED_LISTINGS[selectedIndex];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* 1. Header Hero */}
      <div className="text-center pt-8 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-xs font-bold mb-4 uppercase tracking-widest shadow-sm">
          <Search className="w-3.5 h-3.5" />
          <span>Inspektur Mobil Bekas Digital & AI Scraper</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
          Beli Mobil Bekas{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400">
            Tanpa Takut Kena Tipu.
          </span>{" "}
          Validasi Iklan & Cek di TKP ala Profesional!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium text-base sm:text-lg leading-relaxed">
          Cukup salin link iklan dari <strong className="text-slate-900 dark:text-white">Facebook Marketplace</strong> atau{" "}
          <strong className="text-slate-900 dark:text-white">OLX</strong>, tempel ke BengkelSaku, dan sistem otomatis mengekstrak foto, spesifikasi, dan klaim penjual. Bawa checklist digital 20 titik inspeksi ke lokasi untuk mendeteksi bekas tabrak, banjir, dan trik montir nakal secara langsung.
        </p>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={loginWithGoogle}
            className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center gap-2.5 shadow-lg shadow-blue-600/25 transition-all active:scale-95 cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>Mulai Inspeksi Mobil Incaran (Gratis)</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            href="/signin"
            className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <span>Masuk Akun</span>
          </Link>
        </div>
      </div>

      {/* 2. Interactive Scraper Demo Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-1 flex items-center gap-2">
              <Search className="w-4 h-4" /> Demo Interaktif Scraper Iklan
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Cara Kerja AI Scraper Iklan Mobil
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
              Pilih contoh iklan di bawah ini untuk melihat bagaimana sistem otomatis mengekstrak foto, klaim penjual, dan menyusun panduan inspeksi di tempat:
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {DEMO_SCRAPED_LISTINGS.map((listing, idx) => (
              <button
                key={listing.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  selectedIndex === idx
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {listing.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mock URL Input */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-8 shadow-inner">
          <ExternalLink className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex-1 text-slate-600 dark:text-slate-400 text-sm font-mono truncate">
            {activeListing.url}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4" /> Data Berhasil Diekstrak AI
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Ad Image / Info */}
          <div className="lg:w-1/3 flex flex-col gap-4">
            <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-3 left-3 bg-blue-600 px-3 py-1 rounded-md text-xs font-bold text-white shadow-md z-10">
                {activeListing.platform}
              </div>
              <Image
                src={activeListing.image}
                alt={activeListing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                Harga Iklan Penjual:
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {activeListing.price}
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {activeListing.title}
              </div>
            </div>
          </div>

          {/* AI Checklist */}
          <div className="lg:w-2/3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2 uppercase tracking-wider text-sm">
              ANALISIS KLAIM PENJUAL OLEH AI:
            </div>
            <p className="text-slate-900 dark:text-white font-extrabold text-xl mb-6">
              Panduan Validasi Fisik Saat Bertemu Penjual di TKP
            </p>

            <div className="space-y-4">
              {activeListing.claims.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex gap-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors shadow-sm"
                >
                  <div className="mt-1">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">
                        &quot;{item.title}&quot;
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 px-2.5 py-1 rounded-md border uppercase font-black self-start sm:self-auto tracking-wider shadow-2xs">
                        Wajib Cek Fisik
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex gap-2 items-start font-medium bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800 dark:text-slate-200 font-bold">
                          Tips BengkelSaku:
                        </strong>{" "}
                        {item.tip}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
              Tersedia 20 titik inspeksi lengkap (Mesin, Kaki, Bodi, Dokumen).
            </div>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full sm:w-auto py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all border border-blue-500 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Daftar & Jalankan Inspeksi Lengkap</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <ExternalLink className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Scraper Link FB & OLX Instan
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Cukup paste link iklan. Semua galeri foto, spesifikasi, dan deskripsi penjual langsung tersimpan ke akun Anda untuk diinspeksi nanti saat bertemu di tempat (COD).
          </p>
        </div>

        <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Deteksi Mobil Tabrak & Banjir
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Checklist memandu Anda mengecek titik las pabrik, sealant kap mesin, lantai bagasi ban serep, dan aroma apek karpet lantai untuk memastikan mobil bukan bekas rendaman air.
          </p>
        </div>

        <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <DollarSign className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Kalkulator Daya Tawar Harga
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Temukan cacat minor (ban botak, paking rembes, pajak mati) dan gunakan hitungan estimasi perbaikan dari AI sebagai senjata ampuh menawar harga hingga jutaan rupiah.
          </p>
        </div>
      </div>

      {/* 4. Bottom Conversion Banner */}
      <div className="rounded-[2rem] bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 p-8 sm:p-10 text-white shadow-xl shadow-blue-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lindungi Uang Puluhan Juta Anda
          </h3>
          <p className="text-blue-100 font-medium max-w-xl text-sm sm:text-base">
            Jangan beli kucing dalam karung. Bawa checklist BengkelSaku di genggaman smartphone Anda saat COD di tempat penjual.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={loginWithGoogle}
            className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-extrabold text-sm shadow-lg hover:scale-105 transition-all cursor-pointer"
          >
            Masuk dengan Google
          </button>
          <Link
            href="/signin"
            className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-blue-950/40 hover:bg-blue-950/60 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-1.5"
          >
            <span>Daftar Email</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

