import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, carInfo, mode, targetPoint } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Gambar foto mobil wajib disertakan." },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey.trim() === "") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    const carName = carInfo
      ? `${carInfo.make || ""} ${carInfo.model || ""} ${carInfo.year || ""}`.trim()
      : "Kendaraan";

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    // -------------------------------------------------------------
    // MODE 1: POINT & INSPECT (User clicks a specific point on photo)
    // -------------------------------------------------------------
    if (mode === "point-inspect") {
      const { x, y } = targetPoint || { x: 50, y: 50 };

      const prompt = `Anda adalah Master Automotive Diagnostician & AR Inspector di BengkelSaku.
Foto terlampir adalah foto fisik nyata mobil: ${carName}.
Pengguna mengklik/menunjuk sebuah komponen tepat di koordinat:
- Posisi Horizontal (X): ${Math.round(x)}% dari kiri ke kanan foto.
- Posisi Vertikal (Y): ${Math.round(y)}% dari atas ke bawah foto.

TUGAS ANDA:
1. Perhatikan objek mekanikal/elektrikal yang berada tepat di atau paling dekat dengan koordinat (X: ${Math.round(x)}%, Y: ${Math.round(y)}%).
2. Identifikasi komponen apa itu dengan akurat.
3. Berikan nama resmi internasional dan nama/istilah bengkel lokal Indonesia yang biasa dipakai montir.
4. Jelaskan fungsi mekanikal dan peran vitalnya dalam sistem mobil.
5. Amati kondisi fisiknya dari foto (apakah tampak basah oli, berkarat, kotor, bersih, atau ada retakan).
6. Sebutkan gejala umum jika komponen ini aus/rusak.
7. Berikan estimasi biaya penggantian part di Indonesia (IDR).

KEMBALIKAN HANYA FORMAT JSON MURNI BERIKUT (TANPA BACKTICKS ATAU TEKS LAIN):
{
  "name": "Nama Resmi Komponen (contoh: Alternator & Puli Drive Belt)",
  "localName": "Istilah Bengkel Lokal (contoh: Dinamo Ampere / Dinamo Cas)",
  "category": "Pelumasan / Pengereman / Pendingin / Pengapian / Kemudi & Kaki / Kelistrikan / Struktur Sasis",
  "functionSummary": "Penjelasan fungsi mekanikal komponen...",
  "visualObservation": "Pengamatan kondisi visual pada foto...",
  "wearSymptoms": ["Gejala 1...", "Gejala 2...", "Gejala 3..."],
  "checkInterval": "Jadwal cek atau interval penggantian (contoh: Tiap 40.000 KM)",
  "estimatedCostOem": "Estimasi biaya part (contoh: Rp 800.000 - Rp 1.500.000)",
  "laborCost": "Estimasi ongkos pasang (contoh: Rp 100.000 - Rp 200.000)",
  "safetyGuide": "Peringatan keselamatan saat menyentuh komponen ini...",
  "sparePartSearch": "Kata kunci pencarian suku cadang (contoh: Alternator Dinamo Ampere)"
}`;

      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.trim()}`;
      const res = await fetch(geminiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[GEMINI POINT INSPECT ERROR]:", errText);
        throw new Error("Gagal menganalisa titik komponen.");
      }

      const data = await res.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
      const parsed = JSON.parse(rawJson);

      return NextResponse.json({
        success: true,
        mode: "point-inspect",
        targetPoint: { x, y },
        component: {
          id: `custom-pin-${Date.now()}`,
          name: parsed.name || "Komponen Terdeteksi",
          localName: parsed.localName || "Part Mesin",
          category: parsed.category || "Mesin",
          view: "engine",
          x,
          y,
          urgency: "PERIKSA",
          functionSummary: parsed.functionSummary || "Komponen pada sistem kendaraan.",
          visualObservation: parsed.visualObservation || "Tampak terpasang pada blok kendaraan.",
          wearSymptoms: parsed.wearSymptoms || ["Suara aneh saat beroperasi", "Performa menurun"],
          checkInterval: parsed.checkInterval || "Periksa berkala tiap servis",
          estimatedCostOem: parsed.estimatedCostOem || "Rp 150.000 - Rp 500.000",
          estimatedCostAftermarket: "Rp 80.000 - Rp 250.000",
          laborCost: parsed.laborCost || "Rp 100.000",
          safetyGuide: parsed.safetyGuide || "Pastikan mesin mati sebelum menyentuh komponen.",
          torqAiPrompt: `Jelaskan lebih lanjut tentang ${parsed.name} (${parsed.localName}) pada mobil ${carName}.`,
          sparePartSearch: parsed.sparePartSearch || parsed.name || "Suku Cadang Mobil",
        },
      });
    }

    // -------------------------------------------------------------
    // MODE 2: AUTO-DETECT (Scan full photo and find 5-10 key components)
    // -------------------------------------------------------------
    const autoPrompt = `Anda adalah Master Automotive Vision AI di BengkelSaku.
Foto terlampir adalah foto fisik nyata mobil: ${carName}.
TUGAS ANDA:
1. Pindai foto ini dan identifikasi 5 hingga 9 komponen mekanikal/elektrikal penting yang tampak terlihat jelas di foto (contoh: Tutup Radiator, Dipstick Oli, Tutup Pengisian Oli, Aki Mobil, Alternator, Box Filter Udara, Master Rem, Kabel Busi, dsb).
2. Tentukan koordinat titik pusat masing-masing komponen dalam persentase gambar:
   - x: persentase horizontal dari tepi kiri gambar (0 sampai 100).
   - y: persentase vertikal dari tepi atas gambar (0 sampai 100).
3. Berikan informasi teknis mendalam untuk setiap komponen yang ditemukan.

KEMBALIKAN HANYA FORMAT JSON ARRAY MURNI BERIKUT (TANPA BACKTICKS ATAU TEKS LAIN):
{
  "detectedView": "engine / undercarriage / chassis / cockpit",
  "components": [
    {
      "id": "comp-1",
      "name": "Nama Resmi Komponen",
      "localName": "Istilah Bengkel Lokal",
      "category": "Pelumasan / Pengereman / Pendingin / Pengapian / Kemudi & Kaki / Kelistrikan / Struktur Sasis",
      "x": 35,
      "y": 45,
      "urgency": "NORMAL / PERIKSA / KRITIS",
      "functionSummary": "Penjelasan fungsi komponen...",
      "visibleCondition": "Kondisi fisik yang terlihat di foto (misal: tampak bersih / ada rembesan)",
      "wearSymptoms": ["Gejala 1", "Gejala 2"],
      "checkInterval": "Jadwal ganti / cek",
      "estimatedCostOem": "Estimasi harga OEM (IDR)",
      "estimatedCostAftermarket": "Estimasi aftermarket (IDR)",
      "laborCost": "Estimasi ongkos pasang (IDR)",
      "safetyGuide": "Tips keselamatan saat cek fisik...",
      "sparePartSearch": "Kata kunci pencarian suku cadang"
    }
  ]
}`;

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.trim()}`;
    const res = await fetch(geminiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: autoPrompt },
              {
                inline_data: {
                  mime_type: mimeType || "image/jpeg",
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[GEMINI AUTO DETECT ERROR]:", errText);
      throw new Error("Gagal memindai komponen dari foto.");
    }

    const data = await res.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    const parsed = JSON.parse(rawJson);

    return NextResponse.json({
      success: true,
      mode: "auto-detect",
      detectedView: parsed.detectedView || "engine",
      components: (parsed.components || []).map((c: any, idx: number) => ({
        id: `auto-pin-${idx}-${Date.now()}`,
        name: c.name || "Komponen Mesin",
        localName: c.localName || "Part Kendaraan",
        category: c.category || "Pelumasan",
        view: parsed.detectedView || "engine",
        x: Math.max(5, Math.min(95, Number(c.x) || 50)),
        y: Math.max(5, Math.min(95, Number(c.y) || 50)),
        urgency: c.urgency || "NORMAL",
        functionSummary: c.functionSummary || "Komponen mekanikal kendaraan.",
        visibleCondition: c.visibleCondition || "Terdeteksi pada foto kendaraan pengguna.",
        wearSymptoms: c.wearSymptoms || ["Gejala aus berkala"],
        checkInterval: c.checkInterval || "Pemeriksaan berkala",
        estimatedCostOem: c.estimatedCostOem || "Rp 100.000 - Rp 350.000",
        estimatedCostAftermarket: c.estimatedCostAftermarket || "Rp 50.000 - Rp 150.000",
        laborCost: c.laborCost || "Rp 75.000",
        safetyGuide: c.safetyGuide || "Pastikan mesin dingin sebelum menyentuh komponen.",
        torqAiPrompt: `Tolong jelaskan kondisi dan fungsi ${c.name} (${c.localName}) untuk mobil ${carName}.`,
        sparePartSearch: c.sparePartSearch || c.name,
      })),
    });
  } catch (error: any) {
    console.error("[ANALYZE AR PHOTO ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal menganalisa foto AR komponen: " + (error?.message || error) },
      { status: 500 }
    );
  }
}
