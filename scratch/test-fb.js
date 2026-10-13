const url = "https://www.facebook.com/share/1C5o2XWn16/";

async function testFb() {
  const uas = [
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
  ];

  for (const ua of uas) {
    try {
      console.log("=== Testing UA:", ua.slice(0, 35));
      const res = await fetch(url, {
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        redirect: "follow",
      });
      console.log("Final URL:", res.url);
      console.log("Status:", res.status);
      const html = await res.text();
      console.log("HTML Length:", html.length);
      const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i)?.[1];
      const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i)?.[1];
      const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
      console.log("og:title:", ogTitle);
      console.log("og:desc:", ogDesc);
      console.log("og:image:", ogImage);
      console.log("title:", title);
      
      const scontentMatches = [...html.matchAll(/https:\/\/[^"'\\<>\s]+scontent[^"'\\<>\s]+/gi)].map(m => m[0]);
      console.log("scontent matches count:", scontentMatches.length);
      if (scontentMatches.length > 0) {
        console.log("Sample scontent:", scontentMatches.slice(0, 3));
      }
    } catch (e) {
      console.log("Err:", e.message);
    }
  }
}
testFb();

