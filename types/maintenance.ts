import { ServiceRecommendation } from "./automotive";

export interface CalculateMaintenanceInput {
  currentOdometer: number;
  lastOdometerService?: number;
  lastServiceDate?: Date | string | null;
  make?: string;
  year?: number;
}

export interface MaintenanceStatusSummary {
  overallHealth: "PRIMA" | "PERHATIAN" | "BUTUH_SERVIS";
  recommendations: ServiceRecommendation[];
  urgentCount: number;
  upcomingCount: number;
}
