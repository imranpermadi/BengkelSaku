import { prisma } from "../db/prisma";

export interface LogAuditParams {
  userId?: string | null;
  rawComplaint: string;
  detectedRisk: "LOW" | "MODERATE" | "CRITICAL_SAFETY";
  toolsTriggered: string[];
  modelUsed: string;
  ipAddress?: string | null;
}

export async function recordDiagnosticAudit(params: LogAuditParams): Promise<void> {
  try {
    await prisma.diagnosticAuditLog.create({
      data: {
        userId: params.userId || null,
        rawComplaint: params.rawComplaint,
        detectedRisk: params.detectedRisk,
        toolsTriggered: params.toolsTriggered,
        modelUsed: params.modelUsed,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    // Non-blocking fallback jika DB terkendala agar user flow tidak mati
    console.error("[SECURITY AUDIT LOG ERROR]:", error);
  }
}
