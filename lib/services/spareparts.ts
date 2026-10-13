import { SparePartItem } from "@/types/agent";
import { validateSparePartQuery } from "../security/tool-governance";

export async function searchSpareParts(rawKeyword: string): Promise<SparePartItem[]> {
  const query = validateSparePartQuery(rawKeyword);

  const fallbackParts: SparePartItem[] = [
    {
      id: "part-fb-1",
      title: "Filter Oli Mesin Genuine OEM",
      category: "Maintenance Filter",
      priceFormatted: "Rp 45.000",
      availability: "Stok Siap Kirim (Katalog Mitra)",
      imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: "part-fb-2",
      title: "Oli Mesin 5W-30 Full Synthetic (4 Liter)",
      category: "Engine Lubricant",
      priceFormatted: "Rp 385.000",
      availability: "Tersedia di Toko Terdekat",
      imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80",
    },
  ];

  try {
    // Gunakan DummyJSON vehicle category atau search API publik
    const res = await fetch(`https://dummyjson.com/products/category/vehicle?limit=3`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return fallbackParts;
    }

    const data = await res.json();
    if (!data.products || data.products.length === 0) {
      return fallbackParts;
    }

    // Kurs simulasi 1 USD ~ Rp 15.800
    return data.products.slice(0, 2).map((item: any) => ({
      id: item.id,
      title: item.title,
      category: item.category || "Automotive Replacement",
      priceFormatted: `Rp ${(Math.round(item.price * 15800)).toLocaleString("id-ID")}`,
      availability: item.stock > 0 ? `Tersedia (${item.stock} unit)` : "Pre-Order",
      imageUrl: item.thumbnail || fallbackParts[0].imageUrl,
    }));
  } catch (error) {
    console.error("[SPAREPART API FAILED]:", error);
    return fallbackParts;
  }
}
