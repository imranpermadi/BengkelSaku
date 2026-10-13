export async function fetchCarImageUrl(
  make: string,
  model: string,
  year?: number
): Promise<string> {
  const query = `${make} ${model}`.trim();
  const fallbackUrl =
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80";

  if (!query) return fallbackUrl;

  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrlimit=1&prop=pageimages&pithumbsize=1000&format=json`;

    const res = await fetch(endpoint, {
      headers: {
        "User-Agent": "BengkelSaku/1.0 (contact@bengkelsaku.local)",
      },
      next: { revalidate: 86400 }, // Cache 24 jam
    });

    if (!res.ok) return fallbackUrl;

    const data = await res.json();
    if (!data.query || !data.query.pages) return fallbackUrl;

    const pages = Object.values(data.query.pages) as any[];
    if (pages.length > 0 && pages[0].thumbnail?.source) {
      return pages[0].thumbnail.source;
    }

    return fallbackUrl;
  } catch (error) {
    console.warn("[CAR IMAGE SEARCH FAILED]:", error);
    return fallbackUrl;
  }
}
