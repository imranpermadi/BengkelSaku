const fs = require("fs");
const html = fs.readFileSync("scratch/fb_full.html", "utf8");

// 1. Check description
let description = "";
const descMatch = html.match(/"redacted_description":\{"text":"(.*?)"\}/);
if (descMatch) {
  description = descMatch[1]
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
  console.log("=== Extracted Description ===");
  console.log(description);
}

// 2. Check title
let title = "";
const titleMatch = html.match(/"marketplace_listing_title":"(.*?)"/) || html.match(/<meta[^>]*property="og:title"[^>]*content="(.*?)"/i);
if (titleMatch) {
  title = titleMatch[1];
  console.log("=== Extracted Title ===", title);
}

// 3. Check price
let price = 0;
let priceFormatted = "";
const priceMatch = html.match(/"listing_price":\{"amount":"(\d+)","currency":"IDR","formatted_amount":"(.*?)"\}/);
if (priceMatch) {
  price = Number(priceMatch[1]);
  priceFormatted = priceMatch[2];
  console.log("=== Extracted Price ===", price, priceFormatted);
} else {
  // If price in description e.g. Rp. 65.000.000
  const matchDescPrice = description.match(/Rp\.?\s*([\d\.]+)/i);
  if (matchDescPrice) {
    const num = Number(matchDescPrice[1].replace(/\./g, ""));
    console.log("Price from description:", num, matchDescPrice[0]);
  }
}

// 4. Check photos
console.log("=== Extracted Photos ===");
const photoMatch = html.match(/"listing_photos":\[(.*?)\]/);
const photos = [];
if (photoMatch) {
  const uris = [...photoMatch[1].matchAll(/"uri":"(https:[^"]+)"/g)].map(m =>
    m[1].replace(/\\u00253A/g, ":").replace(/\\u00252F/g, "/").replace(/\\/g, "").replace(/&amp;/g, "&")
  );
  console.log("listing_photos URIs:", uris);
  photos.push(...uris);
}

// Also get all distinct scontent vehicle photos from payload
const scontentMatches = [...html.matchAll(/"uri":"(https:\/\/[^"]*scontent[^"]*)"/g)].map(m =>
  m[1].replace(/\\u00253A/g, ":").replace(/\\u00252F/g, "/").replace(/\\/g, "").replace(/&amp;/g, "&")
);
console.log("scontentMatches total:", scontentMatches.length);
scontentMatches.forEach(u => {
  if (!photos.includes(u)) photos.push(u);
});

console.log("Final Photos count:", photos.length);
photos.forEach((p, idx) => console.log(idx + 1, p.slice(0, 100)));

