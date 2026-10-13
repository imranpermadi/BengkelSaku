const fs = require("fs");
const html = fs.readFileSync("scratch/fb_full.html", "utf8");

// Search for all scontent image urls
const regex = /https:\/\/[^"'\\<>\s]+scontent[^"'\\<>\s]+/gi;
const urls = [...html.matchAll(regex)].map(m => m[0].replace(/&amp;/g, "&").replace(/\\\//g, "/"));

console.log("Found raw scontent matches:", urls.length);

const cleaned = [...new Set(urls.map(u => {
  // unescape unicode if any
  return u.replace(/\\u00253A/g, ":").replace(/\\u00252F/g, "/").replace(/\\/g, "");
}))];

console.log("Distinct cleaned scontent:", cleaned.length);

// Check if these are images
cleaned.forEach((u, i) => {
  console.log(`[${i}]`, u.slice(0, 110));
});

// Test fetch the first 3
async function test() {
  for (let i = 0; i < Math.min(3, cleaned.length); i++) {
    try {
      const res = await fetch(cleaned[i], {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      console.log(`Test [${i}] Status:`, res.status, res.headers.get("content-type"));
    } catch(e) {
      console.log(`Test [${i}] Err:`, e.message);
    }
  }
}
test();

