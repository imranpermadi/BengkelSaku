import { Vehicle } from "@/types/automotive";

export interface ServiceRecord {
  id: string;
  vehicleId?: string;
  vehicleName: string;
  serviceType: string;
  odometerAt: number;
  serviceDate: string;
  cost: string;
  workshopName: string;
  notes: string;
  status: "SELESAI" | "JADWAL_DEKAT";
}

const VEHICLES_KEY = "bengkelsaku_user_vehicles";
const LOGS_KEY = "bengkelsaku_user_logs";
const TARGET_CARS_KEY = "bengkelsaku_user_target_cars";

// Helper helper untuk request ke PostgreSQL API secara non-blocking
function apiCall(endpoint: string, options: RequestInit = {}) {
  if (typeof window === "undefined") return;
  fetch(endpoint, options).catch((err) => {
    console.warn(`[SYNC DB API FAIL - ${endpoint}]:`, err);
  });
}

// =========================================================================
// 1. VEHICLES (PROFIL MOBIL GARASI)
// =========================================================================

export function getStoredVehicles(userKey: string = "default"): Vehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${VEHICLES_KEY}_${userKey}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Gagal membaca garasi mobil", e);
    return [];
  }
}

export function saveStoredVehicle(vehicle: Vehicle, userKey: string = "default"): Vehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredVehicles(userKey);
    const updated = [vehicle, ...current.filter((v) => v.id !== vehicle.id)];
    localStorage.setItem(`${VEHICLES_KEY}_${userKey}`, JSON.stringify(updated));

    // Sinkronisasi permanen ke PostgreSQL
    apiCall(`/api/vehicles?userKey=${encodeURIComponent(userKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicle),
    });

    return updated;
  } catch (e) {
    console.error("Gagal menyimpan mobil", e);
    return [];
  }
}

export function updateStoredVehicleOdometer(
  vehicleId: string,
  newOdo: number,
  userKey: string = "default"
): Vehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredVehicles(userKey);
    const updated = current.map((v) =>
      v.id === vehicleId ? { ...v, currentOdometer: newOdo } : v
    );
    localStorage.setItem(`${VEHICLES_KEY}_${userKey}`, JSON.stringify(updated));

    // Sinkronisasi update ke PostgreSQL
    apiCall(`/api/vehicles?userKey=${encodeURIComponent(userKey)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: vehicleId, currentOdometer: newOdo }),
    });

    return updated;
  } catch (e) {
    console.error("Gagal update odometer", e);
    return [];
  }
}

export function updateStoredVehicle(
  updatedVehicle: Vehicle,
  userKey: string = "default"
): Vehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredVehicles(userKey);
    const updated = current.map((v) =>
      v.id === updatedVehicle.id ? updatedVehicle : v
    );
    localStorage.setItem(`${VEHICLES_KEY}_${userKey}`, JSON.stringify(updated));

    // Sinkronisasi update ke PostgreSQL
    apiCall(`/api/vehicles?userKey=${encodeURIComponent(userKey)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedVehicle),
    });

    return updated;
  } catch (e) {
    console.error("Gagal update data mobil", e);
    return [];
  }
}

export function deleteStoredVehicle(
  vehicleId: string,
  userKey: string = "default"
): Vehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredVehicles(userKey);
    const updated = current.filter((v) => v.id !== vehicleId);
    localStorage.setItem(`${VEHICLES_KEY}_${userKey}`, JSON.stringify(updated));

    // Sinkronisasi hapus ke PostgreSQL
    apiCall(
      `/api/vehicles?userKey=${encodeURIComponent(userKey)}&id=${encodeURIComponent(vehicleId)}`,
      { method: "DELETE" }
    );

    return updated;
  } catch (e) {
    console.error("Gagal menghapus mobil", e);
    return [];
  }
}

// Sinkronisasi 2 arah dengan PostgreSQL Database
export async function syncVehiclesWithDatabase(
  userKey: string = "default"
): Promise<Vehicle[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch(`/api/vehicles?userKey=${encodeURIComponent(userKey)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
        localStorage.setItem(`${VEHICLES_KEY}_${userKey}`, JSON.stringify(data.vehicles));
        return data.vehicles;
      } else {
        // Jika database PostgreSQL masih kosong tapi localStorage punya data, upload otomatis ke PostgreSQL!
        const local = getStoredVehicles(userKey);
        if (local.length > 0) {
          await fetch(`/api/vehicles?userKey=${encodeURIComponent(userKey)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicles: local }),
          });
        }
        return local;
      }
    }
  } catch (e) {
    console.warn("Gagal sinkronisasi data mobil dengan server DB:", e);
  }
  return getStoredVehicles(userKey);
}

// =========================================================================
// 2. MAINTENANCE LOGS (CATATAN PEMELIHARAAN / SERVIS)
// =========================================================================

export function getStoredLogs(userKey: string = "default"): ServiceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${LOGS_KEY}_${userKey}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Gagal membaca buku servis", e);
    return [];
  }
}

export function saveStoredLog(log: ServiceRecord, userKey: string = "default"): ServiceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredLogs(userKey);
    const updated = [log, ...current.filter((l) => l.id !== log.id)];
    localStorage.setItem(`${LOGS_KEY}_${userKey}`, JSON.stringify(updated));

    // Sinkronisasi permanen ke PostgreSQL
    apiCall(`/api/maintenance?userKey=${encodeURIComponent(userKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });

    return updated;
  } catch (e) {
    console.error("Gagal menyimpan catatan servis", e);
    return [];
  }
}

export function deleteStoredLog(logId: string, userKey: string = "default"): ServiceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredLogs(userKey);
    const updated = current.filter((l) => l.id !== logId);
    localStorage.setItem(`${LOGS_KEY}_${userKey}`, JSON.stringify(updated));

    // Sinkronisasi hapus ke PostgreSQL
    apiCall(
      `/api/maintenance?userKey=${encodeURIComponent(userKey)}&id=${encodeURIComponent(logId)}`,
      { method: "DELETE" }
    );

    return updated;
  } catch (e) {
    console.error("Gagal menghapus catatan servis", e);
    return [];
  }
}

export async function syncLogsWithDatabase(
  userKey: string = "default"
): Promise<ServiceRecord[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch(`/api/maintenance?userKey=${encodeURIComponent(userKey)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.logs) && data.logs.length > 0) {
        localStorage.setItem(`${LOGS_KEY}_${userKey}`, JSON.stringify(data.logs));
        return data.logs;
      } else {
        // Jika DB kosong, migrasikan data local ke PostgreSQL
        const local = getStoredLogs(userKey);
        if (local.length > 0) {
          await fetch(`/api/maintenance?userKey=${encodeURIComponent(userKey)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logs: local }),
          });
        }
        return local;
      }
    }
  } catch (e) {
    console.warn("Gagal sinkronisasi data log dengan server DB:", e);
  }
  return getStoredLogs(userKey);
}

// =========================================================================
// 3. TARGET CARS (MOBIL INCARAN INSPEKSI FB / OLX)
// =========================================================================

export function getStoredTargetCars(userKey: string = "default"): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${TARGET_CARS_KEY}_${userKey}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Gagal membaca daftar mobil incaran", e);
    return [];
  }
}

export function saveStoredTargetCar(targetCar: any, userKey: string = "default"): any[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredTargetCars(userKey);
    const updated = [targetCar, ...current.filter((c) => c.id !== targetCar.id)];
    localStorage.setItem(`${TARGET_CARS_KEY}_${userKey}`, JSON.stringify(updated));

    // Sinkronisasi permanen ke PostgreSQL
    apiCall(`/api/target-cars?userKey=${encodeURIComponent(userKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(targetCar),
    });

    return updated;
  } catch (e) {
    console.error("Gagal menyimpan mobil incaran", e);
    return [];
  }
}

export function updateStoredTargetCar(updatedCar: any, userKey: string = "default"): any[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredTargetCars(userKey);
    const updated = current.map((c) => (c.id === updatedCar.id ? updatedCar : c));
    localStorage.setItem(`${TARGET_CARS_KEY}_${userKey}`, JSON.stringify(updated));

    // Sinkronisasi update ke PostgreSQL
    apiCall(`/api/target-cars?userKey=${encodeURIComponent(userKey)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCar),
    });

    return updated;
  } catch (e) {
    console.error("Gagal mengupdate mobil incaran", e);
    return [];
  }
}

export function deleteStoredTargetCar(targetCarId: string, userKey: string = "default"): any[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredTargetCars(userKey);
    const updated = current.filter((c) => c.id !== targetCarId);
    localStorage.setItem(`${TARGET_CARS_KEY}_${userKey}`, JSON.stringify(updated));

    // Sinkronisasi hapus ke PostgreSQL
    apiCall(
      `/api/target-cars?userKey=${encodeURIComponent(userKey)}&id=${encodeURIComponent(targetCarId)}`,
      { method: "DELETE" }
    );

    return updated;
  } catch (e) {
    console.error("Gagal menghapus mobil incaran", e);
    return [];
  }
}

export async function syncTargetCarsWithDatabase(
  userKey: string = "default"
): Promise<any[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch(`/api/target-cars?userKey=${encodeURIComponent(userKey)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.cars) && data.cars.length > 0) {
        localStorage.setItem(`${TARGET_CARS_KEY}_${userKey}`, JSON.stringify(data.cars));
        return data.cars;
      } else {
        // Jika DB kosong, migrasikan data local ke PostgreSQL
        const local = getStoredTargetCars(userKey);
        if (local.length > 0) {
          await fetch(`/api/target-cars?userKey=${encodeURIComponent(userKey)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cars: local }),
          });
        }
        return local;
      }
    }
  } catch (e) {
    console.warn("Gagal sinkronisasi data mobil incaran dengan server DB:", e);
  }
  return getStoredTargetCars(userKey);
}

