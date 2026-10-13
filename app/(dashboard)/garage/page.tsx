"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Vehicle } from "@/types/automotive";
import { VehicleDashboardCard } from "@/components/garage/VehicleDashboardCard";
import {
  Car,
  Plus,
  Wrench,
  Gauge,
  Calendar,
  CalendarCheck,
  History,
  X,
  CheckCircle,
  CheckCircle2,
  BookOpen,
  Upload,
  FileText,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  Link as LinkIcon,
  RotateCcw,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { findOemCarSpec } from "@/lib/constants/oemSpecs";
import {
  getStoredVehicles,
  saveStoredVehicle,
  updateStoredVehicle,
  deleteStoredVehicle,
  updateStoredVehicleOdometer,
  getStoredLogs,
  saveStoredLog,
  deleteStoredLog,
  syncVehiclesWithDatabase,
  syncLogsWithDatabase,
  ServiceRecord,
} from "@/lib/storage/user-data";
import { InteractiveDialog, DialogProps } from "@/components/shared/InteractiveDialog";
import { GaragePublicShowcase } from "@/components/showcase/GaragePublicShowcase";

export default function GaragePage() {
  const router = useRouter();
  const { user } = useAuth();
  const userKey = user?.email || "default_user";

  const [dialogState, setDialogState] = useState<DialogProps | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Service Logging Modal State
  const [servicingVehicle, setServicingVehicle] = useState<Vehicle | null>(null);
  const [serviceType, setServiceType] = useState("Ganti Oli Mesin & Filter");
  const [serviceOdometer, setServiceOdometer] = useState<number>(0);
  const [serviceDate, setServiceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [serviceCost, setServiceCost] = useState("350.000");
  const [serviceWorkshop, setServiceWorkshop] = useState("Bengkel Resmi");
  const [serviceNotes, setServiceNotes] = useState("");
  const [serviceLogs, setServiceLogs] = useState<ServiceRecord[]>([]);
  const [expandedLogsVehicleId, setExpandedLogsVehicleId] = useState<string | null>(null);

  // Form State
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(2021);
  const [plate, setPlate] = useState("");
  const [odometer, setOdometer] = useState(30000);
  const [manualFileName, setManualFileName] = useState("");
  const [manualGuideText, setManualGuideText] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isCompressingManual, setIsCompressingManual] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState<string | null>(null);

  const [isSearchingImage, setIsSearchingImage] = useState(false);

  // Photo & Gallery State
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [photoInputUrl, setPhotoInputUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);

  // Otomatis cari foto Wikipedia berdasarkan Merek, Model, Tahun
  const handleFetchWikipediaImage = async (customMake?: string, customModel?: string, customYear?: number) => {
    const qMake = customMake || make;
    const qModel = customModel || model;
    const qYear = customYear || year;
    if (!qMake && !qModel) return;
    setIsSearchingImage(true);
    try {
      const res = await fetch(
        `/api/car-image?make=${encodeURIComponent(qMake)}&model=${encodeURIComponent(
          qModel
        )}&year=${qYear}`
      );
      const data = await res.json();
      if (data.imageUrl) {
        setMainImageUrl(data.imageUrl);
        setIsCustomPhoto(false);
      }
    } catch (e) {
      console.warn("Gagal get Wikipedia photo:", e);
    } finally {
      setIsSearchingImage(false);
    }
  };

  // Upload Foto Utama dari Perangkat
  const handleUploadMainPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      if (base64) {
        setMainImageUrl(base64);
        setIsCustomPhoto(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload Foto Galeri (Bisa multiple file sekaligus)
  const handleUploadGalleryPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target?.result as string;
        if (base64) {
          setGalleryImages((prev) => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Tambah Foto Galeri / Utama via URL
  const handleAddPhotoUrl = () => {
    if (!photoInputUrl.trim()) return;
    const trimmed = photoInputUrl.trim();
    if (!mainImageUrl) {
      setMainImageUrl(trimmed);
      setIsCustomPhoto(true);
    } else {
      setGalleryImages((prev) => [...prev, trimmed]);
    }
    setPhotoInputUrl("");
    setShowUrlInput(false);
  };

  // Jadikan Foto Galeri sebagai Foto Utama
  const handleSetAsMainPhoto = (index: number) => {
    const selected = galleryImages[index];
    const prevMain = mainImageUrl;
    setMainImageUrl(selected);
    setIsCustomPhoto(true);
    setGalleryImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return prevMain ? [prevMain, ...filtered] : filtered;
    });
  };

  // Hapus Foto Galeri
  const handleDeleteGalleryPhoto = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Manual Review & Editor Modal State
  const [reviewingManualVehicle, setReviewingManualVehicle] = useState<Vehicle | null>(null);
  const [reviewManualText, setReviewManualText] = useState("");
  const [reviewManualFileName, setReviewManualFileName] = useState("");
  const [isAutoCompletingOem, setIsAutoCompletingOem] = useState(false);
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  const handleOpenReviewManual = (veh: Vehicle) => {
    setReviewingManualVehicle(veh);
    setReviewManualText(veh.manualGuideText || "");
    setReviewManualFileName(veh.manualFileName || "Buku Manual Panduan");
    setManualSaveSuccess(false);
  };

  const handleAutoCompleteOem = () => {
    if (!reviewingManualVehicle) return;
    setIsAutoCompletingOem(true);
    setTimeout(() => {
      const oemSpec = findOemCarSpec(
        `${reviewingManualVehicle.make} ${reviewingManualVehicle.model} ${reviewingManualVehicle.year}`
      );
      setReviewManualText(oemSpec);
      if (!reviewManualFileName || reviewManualFileName === "Buku Manual Panduan" || reviewManualFileName.includes(".pdf")) {
        setReviewManualFileName(`Spesifikasi Resmi Pabrikan (${reviewingManualVehicle.make} ${reviewingManualVehicle.model})`);
      }
      setIsAutoCompletingOem(false);
    }, 200);
  };

  const handleSaveManualReview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reviewingManualVehicle) return;
    const updatedVeh: Vehicle = {
      ...reviewingManualVehicle,
      manualGuideText: reviewManualText.trim() || null,
      manualFileName: reviewManualFileName.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    const updated = updateStoredVehicle(updatedVeh, userKey);
    setVehicles(updated);
    setManualSaveSuccess(true);
    setTimeout(() => {
      setManualSaveSuccess(false);
      setReviewingManualVehicle(null);
    }, 800);
  };

  useEffect(() => {
    const loaded = getStoredVehicles(userKey);
    setVehicles(loaded);
    setServiceLogs(getStoredLogs(userKey));

    // Sinkronisasi data real-time dengan database PostgreSQL
    syncVehiclesWithDatabase(userKey).then((dbVehicles) => {
      if (dbVehicles && dbVehicles.length > 0) {
        setVehicles(dbVehicles);
      }
    });

    syncLogsWithDatabase(userKey).then((dbLogs) => {
      if (dbLogs && dbLogs.length > 0) {
        setServiceLogs(dbLogs);
      }
    });

    // Auto-update foto jika mobil masih menggunakan foto generik Unsplash
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
          }
        } catch (err) {
          console.warn("Gagal auto-update foto mobil aktual:", err);
        }
      }
    });
  }, [userKey]);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setMake("");
    setModel("");
    setYear(2021);
    setPlate("");
    setOdometer(30000);
    setManualFileName("");
    setManualGuideText("");
    setMainImageUrl("");
    setGalleryImages([]);
    setPhotoInputUrl("");
    setShowUrlInput(false);
    setIsCustomPhoto(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setMake(v.make);
    setModel(v.model);
    setYear(v.year);
    setPlate(v.licensePlate || "");
    setOdometer(v.currentOdometer);
    setManualFileName(v.manualFileName || "");
    setManualGuideText(v.manualGuideText || "");
    setMainImageUrl(v.imageUrl || "");
    setGalleryImages(Array.isArray(v.images) ? [...v.images] : []);
    setPhotoInputUrl("");
    setShowUrlInput(false);
    setIsCustomPhoto(!!(v.imageUrl && !v.imageUrl.includes("wikimedia.org") && !v.imageUrl.includes("wikipedia")));
    setIsModalOpen(true);
  };

  const handleDeleteVehicle = (v: Vehicle) => {
    setDialogState({
      isOpen: true,
      type: "confirm",
      variant: "danger",
      title: "Hapus Mobil dari Garasi?",
      description: `Apakah Anda yakin ingin menghapus ${v.make} ${v.model} (${v.licensePlate || "Tanpa Plat"}) beserta seluruh riwayatnya dari database PostgreSQL?`,
      confirmText: "Ya, Hapus Mobil",
      cancelText: "Batal",
      onConfirm: () => {
        const updated = deleteStoredVehicle(v.id, userKey);
        setVehicles(updated);
        setDialogState(null);
      },
      onCancel: () => setDialogState(null),
    });
  };

  const handleOpenService = (v: Vehicle) => {
    setServicingVehicle(v);
    setServiceType("Ganti Oli Mesin & Filter");
    setServiceOdometer(v.currentOdometer);
    setServiceDate(new Date().toISOString().split("T")[0]);
    setServiceCost("350.000");
    setServiceWorkshop("Bengkel Resmi");
    setServiceNotes("Penggantian oli mesin & filter oli rutin berkala.");
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicingVehicle) return;

    const formattedCost = serviceCost
      ? serviceCost.startsWith("Rp")
        ? serviceCost
        : `Rp ${serviceCost}`
      : "Rp 0";

    const newRecord: ServiceRecord = {
      id: `log-${Date.now()}`,
      vehicleId: servicingVehicle.id,
      vehicleName: `${servicingVehicle.make} ${servicingVehicle.model} (${servicingVehicle.licensePlate || "Tanpa Plat"})`,
      serviceType,
      odometerAt: Number(serviceOdometer) || servicingVehicle.currentOdometer,
      serviceDate: new Date(serviceDate || Date.now()).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      cost: formattedCost,
      workshopName: serviceWorkshop || "Bengkel Mandiri",
      notes: serviceNotes || "Pengerjaan servis berkala.",
      status: "SELESAI",
    };

    const updatedLogs = saveStoredLog(newRecord, userKey);
    setServiceLogs(updatedLogs);

    // Update vehicle's lastServiceDate and odometer (if higher)
    const newKm = Math.max(servicingVehicle.currentOdometer, Number(serviceOdometer) || 0);
    const updatedVeh: Vehicle = {
      ...servicingVehicle,
      lastServiceDate: new Date(serviceDate || Date.now()).toISOString(),
      currentOdometer: newKm,
      updatedAt: new Date().toISOString(),
    };

    const updatedVehicles = updateStoredVehicle(updatedVeh, userKey);
    setVehicles(updatedVehicles);
    setServicingVehicle(null);
  };

  const handleDeleteLog = (logId: string) => {
    setDialogState({
      isOpen: true,
      type: "confirm",
      variant: "danger",
      title: "Hapus Catatan Servis?",
      description: "Catatan riwayat servis ini akan dihapus dari histori pemeliharaan dan database PostgreSQL.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      onConfirm: () => {
        const updated = deleteStoredLog(logId, userKey);
        setServiceLogs(updated);
        setDialogState(null);
      },
      onCancel: () => setDialogState(null),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setManualFileName(file.name);
    setIsReadingFile(true);
    setIsCompressingManual(true);

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target?.result as string;
          const base64Data = result.split(",")[1] || result;
          const res = await fetch("/api/summarize-manual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: "application/pdf",
              fileName: file.name,
              carInfo: { make, model, year: Number(year) || 2020 },
            }),
          });
          const data = await res.json();
          if (data.summary) {
            setManualGuideText(data.summary);
            setCompressionRatio(data.tokenSavedEstimate || "95%");
          }
        } catch (err) {
          console.warn("Gagal kompresi PDF ke Bahasa AI", err);
        } finally {
          setIsReadingFile(false);
          setIsCompressingManual(false);
        }
      };
      reader.onerror = () => {
        setIsReadingFile(false);
        setIsCompressingManual(false);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = (event.target?.result as string) || "";
        setIsReadingFile(false);
        try {
          const res = await fetch("/api/summarize-manual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rawText: text,
              fileName: file.name,
              carInfo: { make, model, year: Number(year) || 2020 },
            }),
          });
          const data = await res.json();
          if (data.summary) {
            setManualGuideText(data.summary);
            setCompressionRatio(data.tokenSavedEstimate || "95%");
          } else {
            setManualGuideText(text);
          }
        } catch {
          setManualGuideText(text);
        } finally {
          setIsCompressingManual(false);
        }
      };
      reader.onerror = () => {
        setIsReadingFile(false);
        setIsCompressingManual(false);
        alert("Gagal membaca isi file.");
      };
      reader.readAsText(file);
    }
  };

  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = mainImageUrl.trim();

    // Jika belum ada foto utama yang dipilih/diupload, coba cari dari Wikipedia
    if (!finalImageUrl) {
      setIsSearchingImage(true);
      try {
        const res = await fetch(
          `/api/car-image?make=${encodeURIComponent(make)}&model=${encodeURIComponent(
            model
          )}&year=${year}`
        );
        const data = await res.json();
        if (data.imageUrl) {
          finalImageUrl = data.imageUrl;
        }
      } catch (err) {
        console.warn("Gagal perbarui foto web", err);
      } finally {
        setIsSearchingImage(false);
      }
    }

    if (!finalImageUrl) {
      finalImageUrl =
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80";
    }

    if (editingVehicle) {
      const updatedVehicle: Vehicle = {
        ...editingVehicle,
        make,
        model,
        year: Number(year),
        licensePlate: plate.toUpperCase(),
        currentOdometer: Number(odometer),
        imageUrl: finalImageUrl,
        images: galleryImages,
        manualFileName: manualFileName.trim() || null,
        manualGuideText: manualGuideText.trim() || null,
        updatedAt: new Date().toISOString(),
      };

      const updated = updateStoredVehicle(updatedVehicle, userKey);
      setVehicles(updated);
      setIsModalOpen(false);
      setEditingVehicle(null);
      return;
    }

    // Mode Tambah Baru
    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      userId: user?.id || "user-1",
      make,
      model,
      year: Number(year),
      licensePlate: plate.toUpperCase(),
      currentOdometer: Number(odometer),
      lastServiceDate: new Date().toISOString(),
      imageUrl: finalImageUrl,
      images: galleryImages,
      manualFileName: manualFileName.trim() || null,
      manualGuideText: manualGuideText.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveStoredVehicle(newVeh, userKey);
    setVehicles(updated);
    setIsModalOpen(false);
    setMake("");
    setModel("");
    setPlate("");
    setManualFileName("");
    setManualGuideText("");
    setMainImageUrl("");
    setGalleryImages([]);
  };

  const handleUpdateOdo = (id: string) => {
    const target = vehicles.find((v) => v.id === id);
    if (!target) return;
    const newOdo = prompt(
      `Perbarui Odometer untuk ${target.make} ${target.model} (KM):`,
      target.currentOdometer.toString()
    );
    if (newOdo && !isNaN(Number(newOdo))) {
      const updated = updateStoredVehicleOdometer(id, Number(newOdo), userKey);
      setVehicles(updated);
    }
  };

  // Jika pengunjung belum login, tampilkan showcase fitur interaktif & promosi pendaftaran
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 pb-28 max-w-6xl mx-auto transition-colors">
        <GaragePublicShowcase />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 sm:p-6 pb-28 max-w-7xl mx-auto space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Car className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            <span>Garasi Mobil Saya ({vehicles.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {user
              ? `Kendaraan terdaftar milik ${user.name}`
              : "Daftar kendaraan Anda yang terhubung dengan sistem pemantauan servis TORQ AI."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Mobil Baru</span>
        </button>
      </div>

      {/* Kondisi Empty State */}
      {vehicles.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Car className="h-8 w-8" />
          </div>
          <div className="max-w-sm mx-auto space-y-1.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Garasi Anda Masih Kosong
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Belum ada mobil yang didaftarkan pada akun ini. Silakan input mobil Anda agar sistem dapat memantau jadwal ganti oli dan kampas rem.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="min-h-[46px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Daftarkan Mobil Pertama Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((veh) => {
            const vehicleLogs = serviceLogs.filter(
              (l) =>
                l.vehicleId === veh.id ||
                l.vehicleName.toLowerCase().includes(veh.model.toLowerCase())
            );
            const isLogsExpanded = expandedLogsVehicleId === veh.id;

            return (
              <div key={veh.id} className="space-y-3">
                <VehicleDashboardCard
                  vehicle={veh}
                  onAskAI={() => router.push("/diagnose")}
                  onUpdateOdometer={handleUpdateOdo}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteVehicle}
                  onRecordService={handleOpenService}
                  onReviewManual={handleOpenReviewManual}
                  onOpenArInspector={(v) => router.push(`/ar-inspector?vehicleId=${v.id}`)}
                />

                {/* Riwayat Servis Mobil Terdaftar (Expandable Drawer) */}
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedLogsVehicleId(isLogsExpanded ? null : veh.id)
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Riwayat Servis Unit Ini
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                        {vehicleLogs.length} catatan
                      </span>
                    </div>
                    {isLogsExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    )}
                  </button>

                  {isLogsExpanded && (
                    <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800 space-y-3 text-xs">
                      {vehicleLogs.length === 0 ? (
                        <div className="py-4 text-center text-slate-400 dark:text-slate-500 space-y-1">
                          <p className="font-semibold text-xs text-slate-500 dark:text-slate-400">
                            Belum ada riwayat servis untuk {veh.make} {veh.model}
                          </p>
                          <p className="text-[11px]">
                            Klik tombol <strong>Catat Servis</strong> di atas untuk mencatat penggantian oli, kampas rem, atau servis berkala.
                          </p>
                        </div>
                      ) : (
                        vehicleLogs.map((log) => (
                          <div key={log.id} className="pt-3 first:pt-0 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {log.serviceType}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-[11px]">
                                  {log.cost}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLog(log.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                  title="Hapus riwayat ini"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>
                                Odo:{" "}
                                <strong className="font-mono text-slate-700 dark:text-slate-300">
                                  {log.odometerAt.toLocaleString("id-ID")} KM
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Tanggal:{" "}
                                <strong className="text-slate-700 dark:text-slate-300">
                                  {log.serviceDate}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Bengkel:{" "}
                                <strong className="text-slate-700 dark:text-slate-300">
                                  {log.workshopName}
                                </strong>
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                {log.notes}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Mobil */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-orange-500" />
                <span>{editingVehicle ? "Edit Data Mobil" : "Registrasi Mobil Baru"}</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingVehicle(null);
                }}
                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Merek
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Toyota, Honda, Suzuki"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Model / Varian
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Avanza, Brio, Atoz"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Pembuatan
                  </label>
                  <input
                    type="number"
                    required
                    min={1990}
                    max={2026}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Polisi (Plat)
                  </label>
                  <input
                    type="text"
                    placeholder="B 1234 ABC"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Odometer Terkini (KM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={0}
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    className="w-full min-h-[42px] pl-3.5 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono font-bold"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 font-bold">
                    KM
                  </span>
                </div>
              </div>

              {/* Foto Utama & Galeri Mobil */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-orange-500" />
                    <span>Foto Utama & Galeri Mobil</span>
                  </label>
                  {mainImageUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                      {isCustomPhoto ? "Foto Kustom Anda" : "Wikipedia Otomatis"}
                    </span>
                  )}
                </div>

                {/* Preview Foto Utama */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  {mainImageUrl ? (
                    <>
                      <Image
                        src={mainImageUrl}
                        alt="Foto Utama Mobil"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                        <span className="truncate max-w-[200px]">
                          {isCustomPhoto ? "Foto Utama Pilihan Anda" : `Foto Web: ${make || "Mobil"} ${model || ""}`}
                        </span>
                        {galleryImages.length > 0 && (
                          <span className="bg-black/60 px-2 py-0.5 rounded-lg text-[10px]">
                            +{galleryImages.length} Foto Galeri
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <ImageIcon className="h-8 w-8 stroke-[1.5] mb-1 text-slate-300" />
                      <span className="text-xs font-medium">Belum ada foto mobil</span>
                      <span className="text-[10px] text-slate-400">
                        Upload foto Anda atau klik cari dari Wikipedia
                      </span>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi Foto Utama */}
                <div className="grid grid-cols-3 gap-2">
                  <label className="min-h-[38px] px-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer border border-orange-200 transition-all text-center">
                    <Upload className="h-3.5 w-3.5 shrink-0" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadMainPhoto}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleFetchWikipediaImage()}
                    disabled={isSearchingImage || (!make && !model)}
                    className="min-h-[38px] px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 disabled:opacity-50 text-sky-700 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-sky-200 transition-all text-center cursor-pointer"
                  >
                    {isSearchingImage ? (
                      <span className="h-3.5 w-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>Wikipedia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="min-h-[38px] px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-slate-200 transition-all text-center cursor-pointer"
                  >
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>Link URL</span>
                  </button>
                </div>

                {/* Input URL jika tombol Link URL ditekan */}
                {showUrlInput && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 animate-fadeIn">
                    <input
                      type="url"
                      placeholder="Paste link URL foto mobil..."
                      value={photoInputUrl}
                      onChange={(e) => setPhotoInputUrl(e.target.value)}
                      className="w-full text-xs bg-transparent focus:outline-none px-2 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Terapkan
                    </button>
                  </div>
                )}

                {/* Sub-bagian Galeri Foto Mobil Tambahan */}
                <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">
                        Galeri Foto Tambahan ({galleryImages.length})
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Foto interior, sasis, ruang mesin, bagasi, dll.
                      </span>
                    </div>

                    <label className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors">
                      <Plus className="h-3 w-3" />
                      <span>Tambah Galeri</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadGalleryPhotos}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                        >
                          <Image
                            src={img}
                            alt={`Foto galeri ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSetAsMainPhoto(idx)}
                              title="Jadikan Foto Utama"
                              className="h-6 w-6 rounded-md bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 shadow-xs cursor-pointer"
                            >
                              <Star className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryPhoto(idx)}
                              title="Hapus dari Galeri"
                              className="h-6 w-6 rounded-md bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-xs cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">
                      Belum ada foto galeri tambahan. Anda dapat menambahkan banyak foto sekaligus.
                    </p>
                  )}
                </div>
              </div>

              {/* User Guide / Buku Manual Attachment */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Buku Manual / Panduan Kendaraan (Opsional)</span>
                  </label>
                  {manualFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualFileName("");
                        setManualGuideText("");
                        setCompressionRatio(null);
                      }}
                      className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold"
                    >
                      Hapus Lampiran
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Upload file panduan atau PDF. Sistem akan otomatis mengonversi ke format <strong>Bahasa AI Ringkas</strong> yang hemat token untuk referensi konsultasi TORQ AI.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 text-xs text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                    <Upload className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <span className="line-clamp-1 font-medium">
                      {manualFileName
                        ? `File: ${manualFileName}`
                        : "Upload Buku Manual (.pdf, .txt, .md, .doc)"}
                    </span>
                    <input
                      type="file"
                      accept=".txt,.md,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {isCompressingManual && (
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-700 dark:text-sky-300 flex items-center gap-2 animate-pulse">
                    <Sparkles className="h-4 w-4 animate-spin text-sky-600 dark:text-sky-400" />
                    <span>Mengonversi dokumen manual menjadi <strong>Bahasa AI (Hemat Token)</strong>...</span>
                  </div>
                )}

                {compressionRatio && !isCompressingManual && (
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Terkonversi ke Bahasa AI
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-[10px] font-black">
                      Hemat Token ~{compressionRatio}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Spesifikasi Profil Bahasa AI
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const carQuery = `${make} ${model} ${year}`.trim();
                      const oem = findOemCarSpec(carQuery);
                      setManualGuideText(oem);
                      if (!manualFileName) {
                        setManualFileName(`Spesifikasi Resmi Pabrikan (${carQuery || "Kendaraan"})`);
                      }
                      setCompressionRatio("95%");
                    }}
                    className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>⚡ Lengkapi Data Resmi Pabrikan</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={manualGuideText}
                  onChange={(e) => setManualGuideText(e.target.value)}
                  placeholder="Profil Pengetahuan AI (Oli mesin, kapasitas fluida, tipe busi, tekanan ban, dll)..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSearchingImage}
                className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
              >
                {isSearchingImage ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mencari Foto Aktual Mobil di Web...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>{editingVehicle ? "Simpan Perubahan Mobil" : "Simpan Mobil ke Garasi"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Servis (Bound strictly to servicingVehicle) */}
      {servicingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Buku Catatan Servis Kendaraan
                </span>
                <h2 className="text-base font-black text-slate-900 mt-0.5">
                  Catat Servis: {servicingVehicle.make} {servicingVehicle.model} ({servicingVehicle.licensePlate || "Tanpa Plat"})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setServicingVehicle(null)}
                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
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
                          ? "bg-orange-50 text-orange-700 border-orange-300 font-bold"
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
                  placeholder="Ketik atau pilih jenis servis..."
                  className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                      value={serviceOdometer}
                      onChange={(e) => setServiceOdometer(Number(e.target.value))}
                      className="w-full min-h-[42px] pl-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 font-bold">
                      KM
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Odometer saat ini: {servicingVehicle.currentOdometer.toLocaleString("id-ID")} KM
                  </p>
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
                    className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                    value={serviceCost}
                    onChange={(e) => setServiceCost(e.target.value)}
                    placeholder="350.000"
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bengkel / Pelaksana
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceWorkshop}
                    onChange={(e) => setServiceWorkshop(e.target.value)}
                    placeholder="Bengkel Resmi / DIY"
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Merk oli (misal: Shell Helix 5W-30), part number, atau keluhan yang diperbaiki..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span>Simpan Catatan Servis & Perbarui Garasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Review & Kurasi Hasil Bahasa AI Buku Manual */}
      {reviewingManualVehicle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Review & Kurasi Bahasa AI
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      Spesifikasi Pabrikan
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Unit: <strong className="text-slate-700 dark:text-slate-200">{reviewingManualVehicle.make} {reviewingManualVehicle.model} ({reviewingManualVehicle.year})</strong> — {reviewingManualVehicle.licensePlate || "Tanpa Plat"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReviewingManualVehicle(null)}
                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Status Alert */}
              {reviewManualText.includes("Data tidak tersedia") ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Perhatian: Hasil Ekstraksi AI Memuat "Data tidak tersedia"</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                    Hal ini terjadi jika file manual PDF berupa hasil scan/foto tanpa teks digital OCR. Anda dapat langsung mengisinya dengan <strong>Spesifikasi Resmi Pabrikan {reviewingManualVehicle.make} {reviewingManualVehicle.model}</strong> menggunakan tombol otomatis di bawah.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-medium leading-relaxed">
                    Profil Bahasa AI ini aktif dan disuntikkan secara otomatis saat Anda berkonsultasi dengan <strong>TORQ AI</strong>, sehingga AI mengetahui persis spek oli, busi, dan fluida mobil Anda.
                  </span>
                </div>
              )}

              {/* Action Bar: Auto Complete & File Label */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Label / Asal Dokumen Manual
                  </label>
                  <input
                    type="text"
                    value={reviewManualFileName}
                    onChange={(e) => setReviewManualFileName(e.target.value)}
                    placeholder="Contoh: Atoz.pdf atau Buku Manual Resmi Hyundai Atoz"
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleAutoCompleteOem}
                    disabled={isAutoCompletingOem}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`h-3.5 w-3.5 ${isAutoCompletingOem ? "animate-spin" : ""}`} />
                    <span>⚡ Lengkapi Otomatis Data Pabrikan Resmi</span>
                  </button>
                </div>
              </div>

              {/* Editor Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Isi Profil Spesifikasi (Bisa diedit secara manual):
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {reviewManualText.length} Karakter
                  </span>
                </div>

                <textarea
                  rows={9}
                  value={reviewManualText}
                  onChange={(e) => setReviewManualText(e.target.value)}
                  placeholder="[PROFIL PENGETAHUAN AI RESMI]&#10;• Pelumasan Mesin: SAE 10W-40 3.1L&#10;• Transmisi: MTF 75W-85&#10;• Busi: NGK BPR5EY-11..."
                  className="w-full p-3 rounded-2xl bg-slate-900 text-emerald-400 border border-slate-700 font-mono text-[11.5px] leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none selection:bg-sky-500/30 shadow-inner"
                />
              </div>

              {/* Categories Preview */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Pelumasan Mesin",
                  "Transmisi & Rem",
                  "Sistem Pendingin",
                  "Pengapian & Kelistrikan",
                  "Kaki-Kaki & Ban",
                  "Interval Servis Wajib",
                ].map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setReviewingManualVehicle(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleSaveManualReview}
                className={`min-h-[42px] px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md ${
                  manualSaveSuccess
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/25"
                }`}
              >
                {manualSaveSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Tersimpan ke Garasi!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Simpan Perubahan Profil AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Custom Modal Dialog */}
      {dialogState && (
        <InteractiveDialog
          {...dialogState}
          onClose={() => setDialogState(null)}
        />
      )}
    </div>
  );
}
