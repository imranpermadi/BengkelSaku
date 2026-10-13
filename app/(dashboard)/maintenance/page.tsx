"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Plus,
  Wrench,
  CheckCircle2,
  Clock,
  Car,
  Filter,
  AlertTriangle,
  FolderOpen,
  ChevronLeft,
  Trash2,
  X,
  Gauge,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getStoredLogs,
  saveStoredLog,
  deleteStoredLog,
  getStoredVehicles,
  updateStoredVehicle,
  syncVehiclesWithDatabase,
  syncLogsWithDatabase,
  ServiceRecord,
} from "@/lib/storage/user-data";
import { Vehicle } from "@/types/automotive";
import { InteractiveDialog, DialogProps } from "@/components/shared/InteractiveDialog";
import { MaintenancePublicShowcase } from "@/components/showcase/MaintenancePublicShowcase";

export default function MaintenancePage() {
  const { user } = useAuth();
  const userKey = user?.email || "default_user";

  const [logs, setLogs] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedFilterVehicleId, setSelectedFilterVehicleId] = useState<string>("all");

  // Modal Catat Servis
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [serviceType, setServiceType] = useState("Ganti Oli Mesin & Filter");
  const [odometerAt, setOdometerAt] = useState<number>(30000);
  const [serviceDate, setServiceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [cost, setCost] = useState("350.000");
  const [workshopName, setWorkshopName] = useState("Bengkel Resmi");
  const [notes, setNotes] = useState("");

  const [dialogConfig, setDialogConfig] = useState<DialogProps>({
    isOpen: false,
    title: "",
    description: "",
    type: "alert",
    variant: "info",
  });

  useEffect(() => {
    const loadedVehicles = getStoredVehicles(userKey);
    const loadedLogs = getStoredLogs(userKey);
    setVehicles(loadedVehicles);
    setLogs(loadedLogs);

    if (loadedVehicles.length > 0) {
      setSelectedVehicleId(loadedVehicles[0].id);
      setOdometerAt(loadedVehicles[0].currentOdometer);
    }

    // Sinkronisasi data real-time dengan database PostgreSQL
    syncVehiclesWithDatabase(userKey).then((dbVehs) => {
      if (dbVehs && dbVehs.length > 0) {
        setVehicles(dbVehs);
      }
    });

    syncLogsWithDatabase(userKey).then((dbLogs) => {
      if (dbLogs && dbLogs.length > 0) {
        setLogs(dbLogs);
      }
    });
  }, [userKey]);

  const handleOpenAddModal = (targetVehId?: string) => {
    if (vehicles.length === 0) {
      setDialogConfig({
        isOpen: true,
        type: "alert",
        title: "Garasi Masih Kosong",
        description: "Silakan daftarkan mobil Anda di Garasi terlebih dahulu sebelum mencatat servis.",
        variant: "warning",
      });
      return;
    }

    const vehId = targetVehId || selectedVehicleId || vehicles[0].id;
    const veh = vehicles.find((v) => v.id === vehId) || vehicles[0];

    setSelectedVehicleId(veh.id);
    setServiceType("Ganti Oli Mesin & Filter");
    setOdometerAt(veh.currentOdometer);
    setServiceDate(new Date().toISOString().split("T")[0]);
    setCost("350.000");
    setWorkshopName("Bengkel Resmi");
    setNotes("Perawatan servis rutin berkala.");
    setIsModalOpen(true);
  };

  const handleVehicleChangeInModal = (vehId: string) => {
    setSelectedVehicleId(vehId);
    const target = vehicles.find((v) => v.id === vehId);
    if (target) {
      setOdometerAt(target.currentOdometer);
    }
  };

  const handleSubmitService = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVeh = vehicles.find((v) => v.id === selectedVehicleId);
    if (!targetVeh) return;

    const formattedCost = cost
      ? cost.startsWith("Rp")
        ? cost
        : `Rp ${cost}`
      : "Rp 0";

    const newRecord: ServiceRecord = {
      id: `log-${Date.now()}`,
      vehicleId: targetVeh.id,
      vehicleName: `${targetVeh.make} ${targetVeh.model} (${targetVeh.licensePlate || "Tanpa Plat"})`,
      serviceType,
      odometerAt: Number(odometerAt) || targetVeh.currentOdometer,
      serviceDate: new Date(serviceDate || Date.now()).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      cost: formattedCost,
      workshopName: workshopName || "Bengkel Mandiri",
      notes: notes || "Pengerjaan servis berkala.",
      status: "SELESAI",
    };

    const updatedLogs = saveStoredLog(newRecord, userKey);
    setLogs(updatedLogs);

    // Auto-update target vehicle lastServiceDate and odometer (if higher)
    const newKm = Math.max(targetVeh.currentOdometer, Number(odometerAt) || 0);
    const updatedVeh: Vehicle = {
      ...targetVeh,
      lastServiceDate: new Date(serviceDate || Date.now()).toISOString(),
      currentOdometer: newKm,
      updatedAt: new Date().toISOString(),
    };
    const updatedVehicles = updateStoredVehicle(updatedVeh, userKey);
    setVehicles(updatedVehicles);

    setIsModalOpen(false);
  };

  const handleDeleteRecord = (logId: string) => {
    setDialogConfig({
      isOpen: true,
      type: "confirm",
      variant: "danger",
      title: "Hapus Catatan Servis?",
      description: "Catatan riwayat servis ini akan dihapus dari histori pemeliharaan dan database PostgreSQL.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      onConfirm: () => {
        const updated = deleteStoredLog(logId, userKey);
        setLogs(updated);
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setDialogConfig((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedFilterVehicleId === "all") return true;
    return (
      log.vehicleId === selectedFilterVehicleId ||
      vehicles.find((v) => v.id === selectedFilterVehicleId && log.vehicleName.includes(v.model))
    );
  });

  // Jika pengunjung belum login, tampilkan showcase interaktif buku servis & estimator biaya
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 pb-28 max-w-5xl mx-auto transition-colors">
        <MaintenancePublicShowcase />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-amber-50/20 text-slate-800 p-4 sm:p-6 pb-28 max-w-5xl mx-auto space-y-6">
      {/* Navigation breadcrumb back to Garage */}
      <div className="flex items-center justify-between">
        <Link
          href="/garage"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Kembali ke Garasi Mobil</span>
        </Link>

        <span className="text-xs text-slate-500 font-medium">
          Terhubung otomatis dengan kendaraan garasi
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            <span>Buku Servis & Riwayat Kendaraan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Catatan perawatan rutin yang merujuk langsung ke mobil terdaftar di Garasi Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddModal()}
          className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Catat Servis Baru</span>
        </button>
      </div>

      {/* Warning banner if no vehicle is registered */}
      {vehicles.length === 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between gap-3 text-amber-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span className="text-xs font-medium">
              Anda belum memiliki mobil terdaftar di garasi. Catat servis harus merujuk ke mobil yang didaftarkan.
            </span>
          </div>
          <Link
            href="/garage"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors"
          >
            Daftarkan Mobil
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Servis Tercatat</span>
            <p className="text-xl font-black text-slate-900">{logs.length} Catatan</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Mobil Terpantau</span>
            <p className="text-xl font-black text-slate-900">{vehicles.length} Unit Garasi</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Status Pemeliharaan</span>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400">
              {logs.length > 0 ? "Terdokumentasi" : "Belum Ada"}
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Filter Pills */}
      {vehicles.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="h-3.5 w-3.5" />
            Filter Mobil:
          </span>
          <button
            type="button"
            onClick={() => setSelectedFilterVehicleId("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedFilterVehicleId === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Semua Unit ({logs.length})
          </button>
          {vehicles.map((v) => {
            const count = logs.filter(
              (l) => l.vehicleId === v.id || l.vehicleName.toLowerCase().includes(v.model.toLowerCase())
            ).length;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedFilterVehicleId(v.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedFilterVehicleId === v.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {v.make} {v.model} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Timeline List / Empty State */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Histori Catatan Pengerjaan Bengkel</span>
          </h2>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {filteredLogs.length} Riwayat
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="max-w-xs mx-auto space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Buku Servis Masih Kosong
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {vehicles.length === 0
                  ? "Daftarkan mobil di garasi Anda terlebih dahulu untuk mencatat riwayat servis."
                  : "Belum ada riwayat pengerjaan bengkel yang dicatat untuk kendaraan ini."}
              </p>
            </div>
            {vehicles.length > 0 ? (
              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="min-h-[42px] px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-blue-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>Catat Servis Pertama</span>
              </button>
            ) : (
              <Link
                href="/garage"
                className="min-h-[42px] px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-blue-500/20"
              >
                <Car className="h-4 w-4" />
                <span>Buka Garasi Mobil</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="py-4 first:pt-2 last:pb-2 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Car className="h-3 w-3" />
                      {log.vehicleName}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {log.serviceType}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {log.cost}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      {log.odometerAt.toLocaleString("id-ID")} km
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(log.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus riwayat servis ini"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {log.notes}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>
                    Bengkel: <strong className="text-slate-700 font-semibold">{log.workshopName}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Tanggal: <strong className="text-slate-700 font-semibold">{log.serviceDate}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Catat Servis (With explicit vehicle selection) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Buku Catatan Servis Kendaraan
                </span>
                <h2 className="text-base font-black text-slate-900 mt-0.5">
                  Catat Servis Mobil Garasi
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitService} className="space-y-4">
              {/* Pilih Mobil Terdaftar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Mobil Terdaftar
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleChangeInModal(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.licensePlate || "Tanpa Plat"}) - {v.currentOdometer.toLocaleString("id-ID")} KM
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenis Servis */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Jenis Servis / Penggantian Part
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "Ganti Oli Mesin & Filter",
                    "Ganti Kampas Rem",
                    "Kuras Radiator Coolant",
                    "Ganti Busi & Tune Up",
                    "Servis AC Berkala",
                    "Spooring & Balancing",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setServiceType(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        serviceType === preset
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 font-bold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="Ketik jenis servis..."
                  className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Odometer & Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Odometer Saat Servis (KM)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={odometerAt}
                      onChange={(e) => setOdometerAt(Number(e.target.value))}
                      className="w-full min-h-[42px] pl-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 font-bold">
                      KM
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Servis
                  </label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Biaya & Bengkel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Biaya (Rp)
                  </label>
                  <input
                    type="text"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="350.000"
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bengkel / Pelaksana
                  </label>
                  <input
                    type="text"
                    required
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    placeholder="Bengkel Resmi / DIY"
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Servis / Spesifikasi Part
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Merk oli (misal: Shell Helix 5W-30), nomor seri suku cadang, atau detail pengerjaan..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span>Simpan Catatan Servis & Perbarui Garasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Custom Modal Dialog */}
      <InteractiveDialog
        {...dialogConfig}
        onClose={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

