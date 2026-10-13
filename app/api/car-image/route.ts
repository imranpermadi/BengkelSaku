import { NextRequest, NextResponse } from "next/server";
import { fetchCarImageUrl } from "@/lib/services/car-image";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;

  const imageUrl = await fetchCarImageUrl(make, model, year);

  return NextResponse.json({ imageUrl });
}
