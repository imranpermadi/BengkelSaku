export interface DiagnosticRequest {
  vehicleId?: string;
  complaintText: string;
  imageBase64?: string;
}

export interface VideoTutorial {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface SparePartItem {
  id: string | number;
  title: string;
  category: string;
  priceFormatted: string;
  availability: string;
  imageUrl?: string;
}

export interface DiagnosticResponse {
  analysisSummary: string;
  probableCauses: string[];
  severity: "RINGAN" | "SEDANG" | "BAHAYA";
  safetyFirstNotice: string;
  diySteps: string[];
  recommendedParts: SparePartItem[];
  videoTutorials: VideoTutorial[];
  isFallbackData: boolean;
}
