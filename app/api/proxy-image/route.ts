import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const cleanDecodedUrl = decodeURIComponent(imageUrl)
      .replaceAll("&amp;", "&")
      .replaceAll("\\/", "/")
      .trim();

    // Fetch image using standard browser headers compatible with Wikimedia, Facebook, and CDN hosts
    let imageBuffer: ArrayBuffer | null = null;
    let contentType = "image/jpeg";

    try {
      const res = await fetch(cleanDecodedUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });

      if (res.ok) {
        imageBuffer = await res.arrayBuffer();
        contentType = res.headers.get("content-type") || "image/jpeg";
      }
    } catch (e) {
      console.warn("[PROXY] Upstream direct fetch failed:", e);
    }

    // Jika upstream gagal atau 403 (URL kadaluarsa), berikan fallback foto mobil berkualitas tinggi
    if (!imageBuffer) {
      try {
        const fallback = await fetch(
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"
        );
        imageBuffer = await fallback.arrayBuffer();
        contentType = fallback.headers.get("content-type") || "image/jpeg";
      } catch {
        return new NextResponse("Error fetching fallback image", { status: 500 });
      }
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    console.error("[PROXY IMAGE ERROR]:", err);
    return new NextResponse("Error proxying image", { status: 500 });
  }
}

