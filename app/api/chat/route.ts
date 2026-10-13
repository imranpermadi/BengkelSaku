import { NextRequest, NextResponse } from "next/server";

const TORQ_SYSTEM_PROMPT = `
Anda adalah TORQ AI (Technical & Operational Reliability Quotient AI), asisten mekanik dan konsultan otomotif digital terdepan di BengkelSaku.

Profil & Karakter TORQ AI:
1. Nama: TORQ AI (Technical & Operational Reliability Quotient AI).
2. Peran: Master mekanik & konsultan otomotif cerdas. Anda menguasai mendalam tentang mesin, transmisi (manual & matic), interior/eksterior, pelipatan kursi/fleksibilitas kabin, kelistrikan, kaki-kaki, AC, servis berkala, dan tips otomotif di Indonesia.
3. Gaya Komunikasi: Ramah, praktis, cepat, solutif, to the point, dan tidak bertele-tele. Berikan poin-poin langkah yang jelas agar mudah dipraktikkan langsung di garasi atau TKP.
4. Konteks Mobil Aktif & Panduan Manual: Jika pengguna memiliki mobil aktif atau melampirkan teks buku manual, gunakan spesifikasi dan instruksi resmi mobil tersebut sebagai rujukan utama.
5. Keselamatan Kerja: Selalu ingatkan faktor keamanan (ganjal ban, rem tangan, jack stand) jika pengguna melakukan bongkar pasang sendiri.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], vehicleContext, userKey } = body;

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let vehicleContextPrompt = "";
    if (vehicleContext && vehicleContext.make) {
      vehicleContextPrompt = `
[Konteks Mobil Aktif Pengguna]
- Unit: ${vehicleContext.make} ${vehicleContext.model || ""} (${vehicleContext.year || ""})
- Odometer Terkini: ${vehicleContext.odometer ? `${vehicleContext.odometer.toLocaleString("id-ID")} km` : "N/A"}
`;
      if (vehicleContext.manualGuideText) {
        vehicleContextPrompt += `
[Rujukan Ekstrak Buku Manual Resmi Mobil Ini]:
${vehicleContext.manualGuideText.slice(0, 2000)}
`;
      }
    }

    // Ambil maksimal 8 percakapan terakhir agar respon super cepat
    const historySlice = messages.slice(-8);
    const formattedHistory = historySlice
      .map(
        (m: { sender: string; text?: string; content?: string }) =>
          `${m.sender === "user" ? "Pengguna" : "TORQ AI"}: ${m.text || m.content || ""}`
      )
      .join("\n\n");

    const fullPrompt = `${TORQ_SYSTEM_PROMPT}

${vehicleContextPrompt}

Riwayat Percakapan:
${formattedHistory}

TORQ AI: Berikan jawaban yang tepat, jelas, dan ramah sesuai pertanyaan terakhir pengguna.`;

    let replyText = "";

    // 1. Prioritas Utama: Groq (Kecepatan respon ~700ms - 1.2s)
    if (groqKey && groqKey.trim() !== "") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const groqMessages = [
          { role: "system", content: `${TORQ_SYSTEM_PROMPT}\n${vehicleContextPrompt}` },
          ...historySlice.map((m: any) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text || m.content || "",
          })),
        ];

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: groqMessages,
            max_tokens: 600,
            temperature: 0.7,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          replyText = data.choices?.[0]?.message?.content || "";
        }
      } catch (err: any) {
        console.warn("[CHAT] Groq fetch error, falling back to Gemini:", err?.message || err);
      }
    }

    // 2. Prioritas Kedua: Google Gemini Flash-Lite (Kecepatan respon ~900ms - 1.5s)
    if (!replyText && geminiKey && geminiKey.trim() !== "") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (err: any) {
        console.warn("[CHAT] Gemini flash-lite error:", err?.message || err);
      }
    }

    // 3. Fallback jika offline / quota limit
    if (!replyText) {
      const lastUserMsg = messages[messages.length - 1]?.text || "";
      const lower = lastUserMsg.toLowerCase();
      if (lower.includes("lipat") && (lower.includes("kursi") || lower.includes("seat") || lower.includes("jok"))) {
        replyText =
          "Untuk melipat kursi belakang (seperti pada Hyundai Atoz / city car lainnya):\n\n1. Pastikan sabuk pengaman tidak tersangkut di samping sandaran.\n2. Tarik tali atau kenop tuas pengunci yang terletak di pundak atas kursi belakang (kiri dan kanan).\n3. Dorong sandaran kursi ke depan hingga terlipat rata ke dudukan bawah.\n4. Pada beberapa tipe, dudukan bawah dapat diangkat terlebih dahulu ke depan sebelum sandaran dilipat agar bagasi menjadi benar-benar rata lantai.";
      } else if (lower.includes("oli")) {
        replyText =
          "Untuk penggantian oli berkala, umumnya mobil bensin membutuhkan oli SAE 0W-20, 5W-30, atau 10W-40 tergantung usia dan rekomendasi pabrikan. Pastikan juga mengganti filter oli setiap 1-2 kali siklus ganti oli mesin.";
      } else if (lower.includes("bunyi")) {
        replyText =
          "Bunyi tidak wajar bisa bersumber dari beberapa titik: jika mendecit saat AC on biasanya tali kipas (v-belt) kendor, jika gluduk-gluduk di jalan keriting biasanya karet bushing stabilizer, link stabilizer, atau shockbreaker. Bisa ceritakan lebih detail kapan bunyinya muncul?";
      } else {
        replyText =
          "Halo! Saya TORQ AI, siap membantu segala pertanyaan teknis maupun panduan penggunaan mobil Anda. Ada yang bisa saya bantu jelaskan lebih lanjut?";
      }
    }

    return NextResponse.json({
      reply: replyText.trim(),
    });
  } catch (error: any) {
    console.error("[CHAT API ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal memproses obrolan AI.", details: error?.message },
      { status: 500 }
    );
  }
}

