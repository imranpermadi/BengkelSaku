"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "@/types/automotive";
import { calculateNextService } from "@/lib/services/maintenance-calculator";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Gauge,
  Calendar,
  CalendarCheck,
  ChevronRight,
  ShieldAlert,
  Pencil,
  Trash2,
  BookOpen,
  Crosshair,
} from "lucide-react";

interface VehicleDashboardCardProps {
  vehicle: Vehicle;
  onAskAI?: (vehicle: Vehicle) => void;
  onUpdateOdometer?: (vehicleId: string) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRecordService?: (vehicle: Vehicle) => void;
  onReviewManual?: (vehicle: Vehicle) => void;
  onOpenArInspector?: (vehicle: Vehicle) => void;
}

export function VehicleDashboardCard({
  vehicle,
  onAskAI,
  onUpdateOdometer,
  onEdit,
  onDelete,
  onRecordService,
  onReviewManual,
  onOpenArInspector,
}: VehicleDashboardCardProps) {
  // Hitung status perawatan menggunakan kalkulator servis
  const maintenance = calculateNextService({
    currentOdometer: vehicle.currentOdometer,
    lastServiceDate: vehicle.lastServiceDate,
    make: vehicle.make,
    year: vehicle.year,
  });

  const nextUrgentItem =
    maintenance.recommendations.find((r) => r.urgency === "OVERDUE") ||
    maintenance.recommendations.find((r) => r.urgency === "UPCOMING") ||
    maintenance.recommendations[0];

  const urgencyColors = {
    SAFE: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
      label: "Kondisi Prima",
    },
    UPCOMING: {
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      icon: AlertTriangle,
      label: "Jadwal Dekat",
    },
    OVERDUE: {
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      icon: ShieldAlert,
      label: "Waktunya Servis",
    },
  };

  const statusConfig = urgencyColors[nextUrgentItem.urgency];
  const StatusIcon = statusConfig.icon;
  const allPhotos = React.useMemo(() => {
    const list: string[] = [];
    if (vehicle.imageUrl) list.push(vehicle.imageUrl);
    if (Array.isArray(vehicle.images)) {
      vehicle.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [vehicle.imageUrl, vehicle.images]);

  const [activePhotoIndex, setActivePhotoIndex] = React.useState(0);
  const activeImage = allPhotos[activePhotoIndex] || vehicle.imageUrl;

  return (
    <article className="w-full rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500/40">
      {/* Header Gambar & Badge Plat Nomor */}
      <div className="relative h-48 sm:h-52 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden group">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-400">
            <Wrench className="h-12 w-12 stroke-[1.5]" aria-hidden="true" />
          </div>
        )}

        {/* Plat Nomor & Tahun */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {vehicle.licensePlate && (
            <span className="px-3 py-1 rounded-xl text-xs font-black tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-white/20 shadow-sm backdrop-blur-sm">
              {vehicle.licensePlate}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-black/60 text-white backdrop-blur-sm">
            Tahun {vehicle.year}
          </span>
        </div>

        {/* Status Indikator di Sudut Kanan */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${statusConfig.badge}`}
          >
            <span
              className={`h-2 w-2 rounded-full animate-pulse ${statusConfig.dot}`}
              aria-hidden="true"
            />
            {statusConfig.label}
          </span>
        </div>

        {/* Badge Jumlah Foto Galeri */}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[10px] font-bold shadow-md">
            <span>📷 {activePhotoIndex + 1}/{allPhotos.length} Foto</span>
          </div>
        )}

        {/* Tombol Navigasi Foto */}
        {allPhotos.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
              }}
              className="pointer-events-auto h-7 w-7 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-md flex items-center justify-center hover:bg-white active:scale-95 transition-all text-xs"
              title="Foto sebelumnya"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
              }}
              className="pointer-events-auto h-7 w-7 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-md flex items-center justify-center hover:bg-white active:scale-95 transition-all text-xs"
              title="Foto berikutnya"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* Mini Galeri Strip Thumbnail jika ada lebih dari 1 foto */}
      {allPhotos.length > 1 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {allPhotos.map((photo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePhotoIndex(idx)}
              className={`relative h-10 w-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                activePhotoIndex === idx
                  ? "border-blue-600 scale-105 shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={photo}
                alt={`Foto galeri ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Konten Utama */}
      <div className="p-5 sm:p-6 flex flex-col gap-4">
        {/* Judul Mobil, Odometer & Tombol Aksi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kendaraan Garasi Utama</span>
              {vehicle.manualGuideText ? (
                <button
                  type="button"
                  onClick={() => onReviewManual?.(vehicle)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all hover:scale-105 active:scale-95 shadow-2xs ${
                    vehicle.manualGuideText.includes("Data tidak tersedia")
                      ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
                      : "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  }`}
                  title="Klik untuk cek & edit hasil ringkasan manual AI"
                >
                  <BookOpen className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span>Manual: {vehicle.manualFileName || "AI Aktif"}</span>
                  <span className="px-1 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {vehicle.manualGuideText.includes("Data tidak tersedia") ? "⚠️ Perlu Review" : "🔍 Cek/Edit"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onReviewManual?.(vehicle)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-300 transition-colors"
                  title="Tambah / lengkapi profil manual AI kendaraan ini"
                >
                  <BookOpen className="h-3 w-3" />
                  <span>+ Profil Manual AI</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {/* Odometer Quick Button */}
            <button
              type="button"
              onClick={() => onUpdateOdometer?.(vehicle.id)}
              className="min-h-[40px] px-3.5 py-2 flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
              aria-label={`Perbarui odometer untuk ${vehicle.make} ${vehicle.model}`}
              title="Klik untuk ubah odometer"
            >
              <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-bold font-mono">
                {vehicle.currentOdometer.toLocaleString("id-ID")} km
              </span>
            </button>

            {/* Edit Button */}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(vehicle)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
                aria-label={`Edit data ${vehicle.make} ${vehicle.model}`}
                title="Edit Data Spesifikasi Mobil"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(vehicle)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 hover:border-rose-200 transition-all active:scale-95 cursor-pointer"
                aria-label={`Hapus ${vehicle.make} ${vehicle.model} dari garasi`}
                title="Hapus Mobil dari Garasi"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Kotak Pengingat Servis Terdekat */}
        <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700 p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              Prioritas Servis Berkala
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
              {nextUrgentItem.distanceRemainingKm > 0
                ? `Sisa ${nextUrgentItem.distanceRemainingKm.toLocaleString("id-ID")} km`
                : "Lewat jadwal servis"}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl p-2 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-xs">
              <StatusIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {nextUrgentItem.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                {nextUrgentItem.userFriendlyDescription}
              </p>
            </div>
          </div>

          <div className="mt-1 pt-2.5 border-t border-slate-200/80 dark:border-slate-700 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="font-medium">Perkiraan Anggaran:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {nextUrgentItem.estimatedCostRange}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Utama */}
        <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => onAskAI?.(vehicle)}
            className="min-h-[42px] flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Tanya TORQ AI</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenArInspector?.(vehicle)}
            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 hover:text-white font-bold text-xs border border-blue-900/60 shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 group cursor-pointer"
            title={`Lihat Visual Asli AR Komponen Mesin & Kaki-kaki ${vehicle.make} ${vehicle.model}`}
          >
            <Crosshair className="h-4 w-4 text-sky-400 group-hover:rotate-90 transition-transform duration-300" />
            <span>Visual AR</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-sky-300 border border-blue-500/30">
              3D
            </span>
          </button>

          <button
            type="button"
            onClick={() => onRecordService?.(vehicle)}
            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            aria-label={`Catat servis untuk ${vehicle.make} ${vehicle.model}`}
          >
            <CalendarCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>Catat Servis</span>
          </button>
        </div>
      </div>
    </article>
  );
}

