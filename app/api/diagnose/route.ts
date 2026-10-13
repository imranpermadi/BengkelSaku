import { NextRequest, NextResponse } from "next/server";
import { validateAutomotiveComplaint } from "@/lib/security/sanitize";
import { evaluateAutomotiveHazard } from "@/lib/security/safety-guardrails";
import { recordDiagnosticAudit } from "@/lib/security/audit-logger";
import { searchYouTubeTutorials } from "@/lib/services/youtube";
import { searchSpareParts } from "@/lib/services/spareparts";
import { DiagnosticResponse } from "@/types/agent";

// System Prompt Mekanik Ahli Otomotif
const EXPERT_MECHANIC_SYSTEM_PROMPT = `
Anda adalah Senior Automotive Technical Inspector dan Master Mechanic di BengkelSaku.
Tugas Anda adalah menganalisa keluhan mobil dan foto kerusakan secara objektif, menenangkan, dan mendalam.

Kaidah Komunikasi & Copywriting:
1. Nada Bicara: Menenangkan, suportif, tanpa menghakimi, dan profesional. Hilangkan kepanikan pengguna.
2. Sederhanakan Jargon: Terjemahkan istilah mekanik yang rumit menjadi penjelasan awam yang logis.
3. Safety First: Tempatkan keselamatan fisik manusia di atas segalanya. Jika perbaikan membutuhkan dongkrak, tekankan pemakaian JACK STAND resmi. Jangan pernah menyarankan perbaikan mandiri untuk sistem bertekanan tinggi atau bahan peledak airbag.
4. Output Terstruktur: Selalu berikan Analisa Ringkas, Kemungkinan Penyebab, Tingkat Keparahan (RINGAN / SEDANG / BAHAYA), Panduan DIY Langkah demi Langkah, dan Peringatan Keselamatan.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { complaintText, imageBase64, vehicleId, userId, vehicleContext } = body;

    // 1. OWASP ASI-01: Validasi & Sanitasi Input
    const validation = validateAutomotiveComplaint(complaintText);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.rejectionReason },
        { status: 400 }
      );
    }
    const cleanComplaint = validation.sanitizedText;

    // 2. OWASP ASI-08: Deterministic Safety Guardrail Check
    const hazardCheck = evaluateAutomotiveHazard(cleanComplaint);
    if (hazardCheck.isCriticalHazard) {
      // Catat log audit risiko tinggi
      await recordDiagnosticAudit({
        userId,
        rawComplaint: cleanComplaint,
        detectedRisk: "CRITICAL_SAFETY",
        toolsTriggered: ["SAFETY_HALT_TRIGGER"],
        modelUsed: "DETERMINISTIC_GUARDRAIL",
        ipAddress: req.headers.get("x-forwarded-for"),
      });

      const safetyHaltResponse: DiagnosticResponse = {
        analysisSummary: `Terdeteksi komponen risiko tinggi: ${hazardCheck.detectedHazardName}. Pekerjaan ini di luar batas toleransi DIY otodidak karena berisiko fatal.`,
        probableCauses: ["Kerusakan sistem keselamatan primer kendaraan"],
        severity: "BAHAYA",
        safetyFirstNotice: hazardCheck.recommendedAction!,
        diySteps: [
          "Matikan kontak mobil segera dan cabut kunci.",
          "Jangan mencoba membongkar komponen ini sendiri.",
          "Hubungi layanan derek darurat / bengkel resmi terdekat.",
        ],
        recommendedParts: [],
        videoTutorials: [],
        isFallbackData: false,
      };

      return NextResponse.json(safetyHaltResponse);
    }

    // 3. Panggil Tool Tergoveransi: YouTube Data API & E-Commerce Spare Parts
    const [tutorials, spareParts] = await Promise.all([
      searchYouTubeTutorials(cleanComplaint),
      searchSpareParts(cleanComplaint),
    ]);

    // 4. Panggil AI Engine Aktif (Gemini / Groq)
    let isFallback = true;
    let analysisResult: DiagnosticResponse;
    let modelNameUsed = "ZERO_CONFIG_FALLBACK";

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let vehicleInfoBlock = "";
    if (vehicleContext) {
      vehicleInfoBlock = `
Informasi Kendaraan Pengguna:
- Unit: ${vehicleContext.make || ""} ${vehicleContext.model || ""} (${vehicleContext.year || ""})
- Odometer: ${vehicleContext.odometer ? `${vehicleContext.odometer} km` : "N/A"}
`;
      if (vehicleContext.manualGuideText) {
        vehicleInfoBlock += `
RUJUKAN RESMI BUKU MANUAL / USER GUIDE PABRIKAN (${vehicleContext.manualFileName || "Owner's Manual"}):
"""
${vehicleContext.manualGuideText}
"""
INSTRUKSI PENTING: Pengguna telah melampirkan teks/ringkasan buku manual resmi di atas. Jika relevan dengan keluhan atau pertanyaan pengguna, prioritaskan spesifikasi resmi pabrikan (seperti spesifikasi/kekentalan oli mesin, kapasitas cairan, jenis busi, torsi, sekring, tekanan ban) dalam analisa Anda agar akurat 100%.
`;
      }
    }

    if (geminiKey || groqKey) {
      const promptText = `${EXPERT_MECHANIC_SYSTEM_PROMPT}
${vehicleInfoBlock}
Analisa keluhan / pertanyaan pemilik mobil berikut:
"${cleanComplaint}"

Wajib kembalikan format JSON murni TANPA pembungkus markdown (tanpa \`\`\`json):
{
  "analysisSummary": "penjelasan menenangkan dan komprehensif bagi pemilik mobil dalam bahasa Indonesia (sebutkan referensi buku manual jika relevan)",
  "probableCauses": ["kemungkinan penyebab 1", "kemungkinan penyebab 2", "kemungkinan penyebab 3"],
  "severity": "RINGAN" | "SEDANG" | "BAHAYA",
  "safetyFirstNotice": "peringatan SOP keselamatan wajib bagi mekanik otodidak (tekankan Jack Stand jika mendongkrak)",
  "diySteps": ["langkah 1", "langkah 2", "langkah 3", "langkah 4"]
}`;

      let rawAiResponseText = "";

      // Prioritas 1: Google Gemini Flash
      if (geminiKey && geminiKey.trim() !== "") {
        try {
          const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
          const { generateText } = await import("ai");
          const google = createGoogleGenerativeAI({ apiKey: geminiKey });
          const res = await generateText({
            model: google("gemini-3.8-flash"),
            prompt: promptText,
          });
          rawAiResponseText = res.text;
          modelNameUsed = "GEMINI_3.8_FLASH";
        } catch (geminiErr: any) {
          console.warn("[GEMINI INFERENCE RETRY/FALLBACK TO GROQ]:", geminiErr?.message || geminiErr);
        }
      }

      // Prioritas 2: Groq Engine (Ultra-fast LLM fallback)
      if (!rawAiResponseText && groqKey && groqKey.trim() !== "") {
        try {
          const { createGroq } = await import("@ai-sdk/groq");
          const { generateText } = await import("ai");
          const groq = createGroq({ apiKey: groqKey });
          const res = await generateText({
            model: groq("openai/gpt-oss-120b"),
            prompt: promptText,
          });
          rawAiResponseText = res.text;
          modelNameUsed = "GROQ_GPT_OSS_120B";
        } catch (groqErr: any) {
          console.warn("[GROQ INFERENCE FAILED]:", groqErr?.message || groqErr);
        }
      }

      if (rawAiResponseText) {
        try {
          const cleanedJson = rawAiResponseText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
          const parsed = JSON.parse(cleanedJson);

          analysisResult = {
            analysisSummary: parsed.analysisSummary || "Analisa keluhan terkonfirmasi oleh asisten mekanik AI.",
            probableCauses: Array.isArray(parsed.probableCauses) ? parsed.probableCauses : ["Komponen aus"],
            severity: ["RINGAN", "SEDANG", "BAHAYA"].includes(parsed.severity) ? parsed.severity : "SEDANG",
            safetyFirstNotice:
              parsed.safetyFirstNotice ||
              "SOP KESELAMATAN: Pastikan mobil terparkir di tempat datar dan gunakan Jack Stand bersertifikasi saat mendongkrak.",
            diySteps: Array.isArray(parsed.diySteps) ? parsed.diySteps : ["Periksa kondisi fisik komponen"],
            recommendedParts: spareParts,
            videoTutorials: tutorials,
            isFallbackData: false,
          };
          isFallback = false;
        } catch (parseErr) {
          console.warn("[FAILED TO PARSE AI JSON, falling back]:", parseErr);
        }
      }
    }

    // Zero-Config Fallback response jika API Key tidak diset atau error
    if (isFallback) {
      analysisResult = {
        analysisSummary: `[Mode Pengujian Zero-Config] Gejala keluhan: "${cleanComplaint}". Sistem mendiagnosa potensi gesekan atau keausan pelumas. Anda tidak perlu panik, kendaraan masih dapat diinspeksi secara mandiri dengan langkah terarah.`,
        probableCauses: [
          "Pelumas mekanis sudah encer atau terkontaminasi kotoran",
          "Karet pelindung debu (dust cover) aus akibat usia pakai",
          "Toleransi clearance baut braket melonggar akibat guncangan jalan",
        ],
        severity: "SEDANG",
        safetyFirstNotice:
          "PERINGATAN KESELAMATAN WAJIB: Jangan sekali-kali bekerja di bawah mobil hanya bertumpu pada dongkrak hidrolik/buaya. Pasang Jack Stand di titik sasis berlogo segitiga!",
        diySteps: [
          "Posisikan mobil di lantai semen rata, pasang ganjal balok pada roda belakang.",
          "Angkat roda dengan dongkrak, kemudian turunkan perlahan hingga sasis bertumpu kokoh di atas Jack Stand.",
          "Gunakan senter LED terang untuk memeriksa apakah ada retakan getas pada karet-karet arm.",
          "Uji kekencangan mur roda menggunakan kunci pas momen (torque wrench) sesuai torsi standar pabrikan.",
        ],
        recommendedParts: spareParts,
        videoTutorials: tutorials,
        isFallbackData: true,
      };
    }

    // 5. OWASP ASI-06: Catat Audit Trail
    await recordDiagnosticAudit({
      userId: userId || null,
      rawComplaint: cleanComplaint,
      detectedRisk: analysisResult!.severity === "BAHAYA" ? "CRITICAL_SAFETY" : "LOW",
      toolsTriggered: ["searchYouTubeTutorials", "searchSpareParts"],
      modelUsed: modelNameUsed,
      ipAddress: req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json(analysisResult!);
  } catch (error: any) {
    console.error("[DIAGNOSE ROUTE CRITICAL ERROR]:", error);
    return NextResponse.json(
      {
        error: "Terjadi gangguan pada pemrosesan diagnosa internal.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
