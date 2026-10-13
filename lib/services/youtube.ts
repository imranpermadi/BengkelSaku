import { VideoTutorial } from "@/types/agent";
import { validateYouTubeQuery } from "../security/tool-governance";

export async function searchYouTubeTutorials(rawQuery: string): Promise<VideoTutorial[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const safeQuery = validateYouTubeQuery(rawQuery);

  // Fallback data jika API key tidak tersedia atau request gagal
  const fallbackTutorials: VideoTutorial[] = [
    {
      id: "fb-yt-1",
      title: "Tutorial Lengkap Ganti Oli & Filter Sendiri di Rumah (SOP Aman)",
      channelTitle: "Mekanik Otodidak Indonesia",
      thumbnailUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80",
      videoUrl: "https://www.youtube.com/results?search_query=" + encodeURIComponent(safeQuery),
    },
    {
      id: "fb-yt-2",
      title: "Cara Benar Cek Ketebalan Kampas Rem Mobil & Penggunaan Jack Stand",
      channelTitle: "Dokter Mobil Edukasi",
      thumbnailUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80",
      videoUrl: "https://www.youtube.com/results?search_query=" + encodeURIComponent(safeQuery),
    },
  ];

  if (!apiKey || apiKey.trim() === "") {
    return fallbackTutorials;
  }

  try {
    const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      safeQuery
    )}&type=video&maxResults=2&key=${apiKey}`;

    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn("[YOUTUBE API ERROR]: Status", res.status, "using fallback data");
      return fallbackTutorials;
    }

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      return fallbackTutorials;
    }

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error("[YOUTUBE FETCH FAILED]:", error);
    return fallbackTutorials;
  }
}
