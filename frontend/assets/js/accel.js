const GAS_BASE_URL =
  "https://script.google.com/macros/s/AKfycbzCIs-Y-Avgs3QC05Yk1SVl3b3-pZ1pxMzrTiUeMeypVNhep0tO7FWDWWQMCIqTptfPXQ/exec";

const GAS_ACCEL_POST = GAS_BASE_URL + "/telemetry/accel";
const GAS_ACCEL_LATEST = GAS_BASE_URL + "/telemetry/accel/latest";

let isRunning = false;
let batchTimer = null;
let batchData = [];

// ── Chart.js setup ──────────────────────────────────────────
let accelChart = null;
const MAX_POINTS = 60;
const chartLabels = [];
const chartX = [],
  chartY = [],
  chartZ = [];

function initChart() {
  const canvas = document.getElementById("accelChart");
  if (!canvas || accelChart) return; // sudah init atau elemen tidak ada

  accelChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: "X",
          data: chartX,
          borderColor: "#ff3d6e",
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: "Y",
          data: chartY,
          borderColor: "#00e5a0",
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: "Z",
          data: chartZ,
          borderColor: "#5b8fff",
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        x: { display: false },
        y: { ticks: { maxTicksLimit: 5 } },
      },
    },
  });
}

function pushChart(x, y, z) {
  if (!accelChart) return;
  const label = new Date().toLocaleTimeString("id-ID");
  chartLabels.push(label);
  chartX.push(x);
  chartY.push(y);
  chartZ.push(z);

  if (chartLabels.length > MAX_POINTS) {
    chartLabels.shift();
    chartX.shift();
    chartY.shift();
    chartZ.shift();
  }
  accelChart.update("none"); // update tanpa animasi agar realtime
}

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
    initChart(); // inisialisasi chart saat mulai
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

  // ✅ FIX 2: Simpan sebagai NUMBER (bukan string .toFixed())
  // toFixed() menghasilkan string "0.123" — GAS butuh angka
  const x = parseFloat((a.x || 0).toFixed(4));
  const y = parseFloat((a.y || 0).toFixed(4));
  const z = parseFloat((a.z || 0).toFixed(4));

  // Update display
  const elX = document.getElementById("val-x");
  const elY = document.getElementById("val-y");
  const elZ = document.getElementById("val-z");
  if (elX) elX.textContent = x.toFixed(3);
  if (elY) elY.textContent = y.toFixed(3);
  if (elZ) elZ.textContent = z.toFixed(3);

  // Push ke grafik realtime
  pushChart(x, y, z);

  batchData.push({ t: new Date().toISOString(), x, y, z });
}

/* ── Send Batch to GAS ─────────────────────── */
async function _sendBatch() {
  if (batchData.length === 0) return;

  const samples = [...batchData];
  batchData = [];
  logLine("log", `Kirim ${samples.length} data point...`, "info");

  const payload = JSON.stringify({
    device_id: typeof DEVICE_ID !== "undefined" ? DEVICE_ID : "dev-001",
    ts: new Date().toISOString(),
    samples,
  });

  // ── GAS membutuhkan redirect: "follow" agar tidak diblokir browser ──
  // Juga gunakan no-cors sebagai fallback jika response tidak bisa dibaca
  try {
    const res = await fetch(GAS_ACCEL_POST, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: payload,
      redirect: "follow", // ← WAJIB: GAS selalu redirect 302 dulu
    });

    // GAS kadang return opaque response, coba parse dulu
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      // Jika tidak bisa di-parse tapi status 200, anggap sukses
      logLine(
        "log",
        `✓ Terkirim ${samples.length} samples (response non-JSON)`,
        "ok",
      );
      return;
    }

    if (data.ok) {
      logLine(
        "log",
        `✓ Terkirim: ${data.data.accepted} samples diterima server`,
        "ok",
      );
    } else {
      logLine("log", `✗ Server error: ${data.error}`, "err");
    }
  } catch (err) {
    // Fallback: coba kirim via no-cors (tidak dapat baca response, tapi data terkirim)
    logLine("log", `⚠ fetch gagal (${err.message}), coba no-cors...`, "info");
    try {
      await fetch(GAS_ACCEL_POST, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload,
        mode: "no-cors", // ← tidak bisa baca response, tapi request terkirim
        redirect: "follow",
      });
      logLine(
        "log",
        `✓ Terkirim via no-cors (${samples.length} samples) — cek Google Sheet!`,
        "ok",
      );
    } catch (err2) {
      logLine("log", `✗ Gagal total: ${err2.message}`, "err");
    }
  }
}

/* ── Update Button State ───────────────────── */
function _updateBtn(active) {
  const btn = document.getElementById("btnAccel");
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
