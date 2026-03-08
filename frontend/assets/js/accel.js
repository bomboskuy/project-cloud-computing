const GAS_ACCEL_URL =
  "https://script.google.com/macros/s/AKfycbzCIs-Y-Avgs3QC05Yk1SVl3b3-pZ1pxMzrTiUeMeypVNhep0tO7FWDWWQMCIqTptfPXQ/exec";

let isRunning = false;
let batchTimer = null;
let batchData = [];

/* ── Toggle Start / Stop ───────────────────── */
function toggleAccel() {
  isRunning ? stopAccel() : startAccel();
}

/* ── Start ─────────────────────────────────── */
function startAccel() {
  if (typeof DeviceMotionEvent === "undefined") {
    logLine("log", "DeviceMotionEvent tidak didukung di browser ini.", "err");
    return;
  }

  const begin = () => {
    isRunning = true;
    _updateBtn(true);
    logLine("log", "Sensor aktif. Batch dikirim setiap 2.5 detik.", "info");
    window.addEventListener("devicemotion", _onMotion);
    batchTimer = setInterval(_sendBatch, 2500);
  };

  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
      .then((state) =>
        state === "granted"
          ? begin()
          : logLine("log", "Izin sensor ditolak.", "err"),
      )
      .catch((e) => logLine("log", "Permission error: " + e, "err"));
  } else {
    begin();
  }
}

/* ── Stop ──────────────────────────────────── */
function stopAccel() {
  isRunning = false;
  clearInterval(batchTimer);
  batchTimer = null;
  window.removeEventListener("devicemotion", _onMotion);
  _updateBtn(false);
  logLine("log", "Dihentikan.", "info");
}

/* ── Device Motion Handler ─────────────────── */
function _onMotion(e) {
  const a = e.accelerationIncludingGravity;
  if (!a) return;

  const x = (a.x || 0).toFixed(3);
  const y = (a.y || 0).toFixed(3);
  const z = (a.z || 0).toFixed(3);

  // Update display
  document.getElementById("val-x").textContent = x;
  document.getElementById("val-y").textContent = y;
  document.getElementById("val-z").textContent = z;

  batchData.push({ x, y, z, t: new Date().toISOString() });
}

/* ── Send Batch to GAS ─────────────────────── */
async function _sendBatch() {
  if (batchData.length === 0) return;

  const samples = [...batchData];
  batchData = [];
  logLine("log", `Kirim ${samples.length} data point...`, "info");

  try {
    const res = await fetch(GAS_ACCEL_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        device_id: DEVICE_ID,
        ts: new Date().toISOString(),
        samples,
      }),
    });
    const data = await res.json();
    logLine("log", "OK: " + JSON.stringify(data), "ok");
  } catch (err) {
    logLine("log", "Gagal kirim: " + err.message, "err");
  }
}

/* ── Update Button State ───────────────────── */
function _updateBtn(active) {
  const btn = document.getElementById("btnAccel");
  const dot = document.getElementById("status-dot");
  if (!btn) return;

  if (active) {
    btn.className = "btn btn-stop";
    btn.innerHTML =
      '<span class="status-dot running" id="status-dot"></span> ■ STOP KIRIM BATCH';
  } else {
    btn.className = "btn btn-primary";
    btn.innerHTML =
      '<span class="status-dot" id="status-dot"></span> ▶ START KIRIM BATCH (2.5 detik)';
  }
}
