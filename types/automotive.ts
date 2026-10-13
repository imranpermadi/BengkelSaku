export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  vin?: string | null;
  currentOdometer: number;
  lastServiceDate?: string | Date | null;
  imageUrl?: string | null;
  images?: string[];
  manualGuideText?: string | null;
  manualFileName?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TargetCar {
  id: string;
  userId: string;
  title: string;
  make: string;
  model: string;
  year: number;
  transmission: "Manual" | "Matic";
  askingPrice: number;
  askingPriceFormatted: string;
  odometer: number;
  sellerDescription: string;
  sellerClaims: string[];
  imageUrl: string;
  images?: string[];
  sourceUrl?: string;
  sourcePlatform?: string;
  manualGuideText?: string | null;
  manualFileName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UrgencyLevel = "SAFE" | "UPCOMING" | "OVERDUE";

export interface ServiceRecommendation {
  id: string;
  category: "OLI_MESIN" | "OLI_TRANSMISI" | "FILTER_UDARA" | "KAMPAS_REM" | "BUSI";
  title: string;
  urgency: UrgencyLevel;
  distanceRemainingKm: number;
  daysRemaining: number;
  estimatedCostRange: string;
  userFriendlyDescription: string;
  safetyInstruction: string;
}
