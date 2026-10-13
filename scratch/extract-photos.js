const fs = require("fs");
const html = fs.readFileSync("scratch/fb_full.html", "utf8");

// Search for listing photos in GraphQL payload
// Typically in listing_photos, photo, or uri:
const matches = [...html.matchAll(/"uri":"(https:[^"]+)"/g)].map(m => m[1]);
console.log("All URI matches count:", matches.length);

const scontentUris = matches.filter(u => u.includes("scontent") && u.includes(".jpg"));
console.log("All scontent URI matches count:", scontentUris.length);

// Also look for unescaped URLs
const unescapedUris = scontentUris.map(u => u.replace(/\\u00253A/g, ":").replace(/\\u00252F/g, "/").replace(/\\/g, "").replace(/&amp;/g, "&"));

// Get unique URIs
const unique = [...new Set(unescapedUris)];
console.log("Unique scontent URIs count:", unique.length);
unique.forEach((u, i) => console.log(i, u.slice(0, 120)));

// Also look for "listing_photos" or "photos" object
const photoBlocks = [...html.matchAll(/"listing_photos":\[(.*?)\]/gs)];
console.log("listing_photos blocks count:", photoBlocks.length);
if (photoBlocks.length > 0) {
  console.log("listing_photos sample:", photoBlocks[0][1].slice(0, 300));
}

// Look for image: { uri: ... } inside listing
const imageObjects = [...html.matchAll(/"image":\s*\{\s*"uri":\s*"([^"]+)"/g)].map(m => m[1]);
console.log("image { uri } count:", imageObjects.length);
imageObjects.forEach((u, i) => console.log("ImgObj", i, u.slice(0, 100)));

