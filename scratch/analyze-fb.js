const fs = require("fs");

async function analyze() {
  const res = await fetch("https://www.facebook.com/share/1C5o2XWn16/", {
    headers: {
      "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
  });
  const html = await res.text();
  console.log("Status:", res.status, "HTML length:", html.length);

  // Check JSON-LD
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    console.log("JSON-LD found:", match[1].slice(0, 300));
  }

  // Check description
  const descPatterns = [
    /"description":\{"text":"(.*?)"\}/g,
    /"redacted_description":\{"text":"(.*?)"\}/g,
    /"listing_description":"(.*?)"/g,
    /"creation_story":\{[^{]*"message":\{"text":"(.*?)"\}/g,
  ];

  for (const pat of descPatterns) {
    const found = [...html.matchAll(pat)];
    if (found.length > 0) {
      console.log("Found with pat", pat.toString(), ":", found.map(m => m[1].slice(0, 150)));
    }
  }

  // Check price
  const pricePatterns = [
    /"formatted_amount":"([^"]+)"/g,
    /"amount":"([^"]+)","currency":"IDR"/g,
    /"price":\{"amount":"([^"]+)"/g,
  ];
  for (const pat of pricePatterns) {
    const found = [...html.matchAll(pat)];
    if (found.length > 0) {
      console.log("Price found with pat", pat.toString(), ":", found.map(m => m[1]));
    }
  }

  // Check all scontent images
  const scontent = [...html.matchAll(/https:\/\/[^"'\\<>\s]+scontent[^"'\\<>\s]+/gi)].map(m => m[0]);
  console.log("Total scontent:", scontent.length);
  // Clean amp;
  const cleanedImages = scontent.map(url => url.replace(/&amp;/g, "&"));
  // Filter for marketplace photos
  const filtered = cleanedImages.filter(u => u.includes("oe=") && !u.includes("p261x260") && !u.includes("s100x100"));
  console.log("Filtered non-thumbnail photos:", filtered.length);
  console.log("All unique filtered:", [...new Set(filtered)].slice(0, 5));

  // Save the full HTML to scratch for deeper search
  fs.writeFileSync("scratch/fb_full.html", html);
}

analyze();

