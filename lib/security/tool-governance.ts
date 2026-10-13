// OWASP ASI-02: Tool Use Governance & Parameter Allowlisting

export const ALLOWED_TOOLS = ["fetch_youtube_tutorials", "search_spare_parts"] as const;

export type AllowedToolName = (typeof ALLOWED_TOOLS)[number];

export function isToolAllowed(toolName: string): toolName is AllowedToolName {
  return ALLOWED_TOOLS.includes(toolName as AllowedToolName);
}

export function validateYouTubeQuery(query: string): string {
  // Hanya izinkan kata kunci relevan otomotif, bersihkan karakter berbahaya
  const cleaned = query
    .replace(/[^\w\s\d\-]/gi, "")
    .trim()
    .slice(0, 80);

  return `${cleaned} tutorial perbaikan mobil cara ganti`;
}

export function validateSparePartQuery(keyword: string): string {
  return keyword
    .replace(/[^\w\s\d\-]/gi, "")
    .trim()
    .slice(0, 50);
}
