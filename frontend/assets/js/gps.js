
let map, marker, polyline;
let watchId = null;
let isRunning = false;
let logCount = 0;

/* ── Init Map (called once) ────────────────── */
function initMap() {
  map = L.map("map").setView([-6.2, 106.8], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
  polyline = L.polyline([], {
    color: "#7c6af7",
    weight: 4,
    opacity: 0.85,
  }).addTo(map);
}

/* ── Start GPS Logging ─────────────────────── */
function startGPS() {
  if (isRunning) return;

  if (!navigator.geolocation) {
    logLine("log", "Geolocation tidak didukung browser ini.", "err");
    return;
  }

  if (!map) initMap();

  isRunning = true;
  _updateBtn(true);
  logLine("log", "GPS aktif. Memantau posisi...", "info");

  watchId = navigator.geolocation.watchPosition(_onPosition, _onError, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 15000,
  });
}

/* ── Stop GPS Logging ──────────────────────── */
function stopGPS() {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  isRunning = false;
  _updateBtn(false);
  logLine("log", "GPS dihentikan.", "info");
}

/* ── On Position Update ────────────────────── */
async function _onPosition(pos) {
  const { latitude: lat, longitude: lng, accuracy } = pos.coords;
  const latlng = [lat, lng];

  // Update map
  if (!marker) {
    marker = L.marker(latlng).addTo(map).bindPopup("Posisi kamu").openPopup();
  } else {
    marker.setLatLng(latlng);
  }
  polyline.addLatLng(latlng);
  map.setView(latlng, 16);

  // Update info strip
  document.getElementById("info-lat").textContent = lat.toFixed(6);
  document.getElementById("info-lng").textContent = lng.toFixed(6);
  document.getElementById("info-pts").textContent = ++logCount;

  logLine(
    "log",
    `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)} (±${accuracy.toFixed(0)}m)`,
    "ok",
  );

  // Send to GAS
  try {
    const url =
      `${BASE_URL}?path=telemetry/gps` +
      `&device_id=${encodeURIComponent(DEVICE_ID)}` +
      `&lat=${lat}&lng=${lng}` +
      `&ts=${encodeURIComponent(new Date().toISOString())}`;

    const res = await fetch(url, { redirect: "follow" });
    const data = await res.json();
    logLine("log", "Terkirim: " + JSON.stringify(data));
  } catch (err) {
    logLine("log", "Gagal kirim: " + err.message, "err");
  }
}

/* ── On GPS Error ──────────────────────────── */
function _onError(err) {
  logLine("log", "GPS Error: " + err.message, "err");
}

/* ── Update Start Button State ─────────────── */
function _updateBtn(active) {
  const btn = document.getElementById("btnStart");
  const dot = document.getElementById("dot");
  if (!btn || !dot) return;

  dot.className = active ? "status-dot running" : "status-dot";
  btn.textContent = active ? "⬛ RUNNING..." : "▶ START LOG GPS";
  // Re-inject dot since we replaced textContent
  btn.prepend(dot);
}

/* ── Auto-init map on load ─────────────────── */
document.addEventListener("DOMContentLoaded", initMap);
