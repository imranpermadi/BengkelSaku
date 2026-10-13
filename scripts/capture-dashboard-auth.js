const http = require("http");
const fs = require("fs");
const path = require("path");

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(JSON.parse(data)));
      res.on("error", reject);
    });
  });
}

async function run() {
  const version = await getJson("http://127.0.0.1:9222/json/version");
  const wsUrl = version.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) cb.reject(msg.error);
      else cb.resolve(msg.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((r) => (ws.onopen = r));

  const { targetId } = await send("Target.createTarget", { url: "http://localhost:4000/signin" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

  function sendSession(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    });
  }

  await sendSession("Page.enable");
  await sendSession("Runtime.enable");
  await sendSession("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Navigate to signin
  await sendSession("Page.navigate", { url: "http://localhost:4000/signin" });
  await new Promise((r) => setTimeout(r, 2000));

  // Click guest button & pre-seed a vehicle for rich telemetry
  const clickGuestAndSeed = `
    const btns = Array.from(document.querySelectorAll('button'));
    const guestBtn = btns.find(b => b.innerText && b.innerText.includes('Masuk Cepat sebagai Tamu'));
    if (guestBtn) {
      guestBtn.click();
    }
    const sampleVehicles = [{
      id: "veh-atoz-1",
      make: "Hyundai",
      model: "Atoz 1.0 GLS",
      year: 2002,
      licensePlate: "B 2002 AZ",
      currentOdometer: 135400,
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
      manualFileName: "Spesifikasi Resmi Pabrikan (Hyundai Atoz 2002)",
      manualGuideText: "Pelumasan Mesin: SAE 10W-40 3.1L. Transmisi: MTF 75W-85 2.1L. Kuras radiator tiap 40.000 KM. Busi: NGK BPR5EY-11."
    }];
    localStorage.setItem("bengkelsaku_user_vehicles_guest@bengkelsaku.local", JSON.stringify(sampleVehicles));
  `;
  await sendSession("Runtime.evaluate", { expression: clickGuestAndSeed });

  // Wait for redirect to /
  await new Promise((r) => setTimeout(r, 2000));

  // Reload or navigate to localhost:4000
  await sendSession("Page.navigate", { url: "http://localhost:4000" });
  await new Promise((r) => setTimeout(r, 2500));

  // Capture screenshot
  const result = await sendSession("Page.captureScreenshot", { format: "png" });
  const buffer = Buffer.from(result.data, "base64");

  const pubOut = path.join(__dirname, "../public/screenshots/10_dashboard_logged_in.png");
  const artOut = "C:\\Users\\6219034372\\.gemini\\antigravity\\brain\\4f1f7eba-3eab-44fd-9e0c-986e4c8f0403\\10_dashboard_logged_in.png";

  fs.writeFileSync(pubOut, buffer);
  fs.writeFileSync(artOut, buffer);
  console.log("Successfully captured logged-in dashboard:", buffer.length, "bytes");

  ws.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
