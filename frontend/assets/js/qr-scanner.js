let html5QrCode = null;

/* ── Tab Switcher ──────────────────────────── */
function showTab(n) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b, i) => b.classList.toggle("active", i === n));
  document.getElementById("tab-0").classList.toggle("hidden", n !== 0);
  document.getElementById("tab-1").classList.toggle("hidden", n !== 1);
}

/* ── Generate QR ───────────────────────────── */
async function generateQR() {
  const course_id = document.getElementById("course_id").value.trim();
  const session_id = document.getElementById("session_id").value.trim();

  const payload = {
    course_id,
    session_id,
    ts: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${BASE_URL}?path=presence/qr/generate`, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Server error ${res.status}`);

    const data = await handleResponse(res);

    if (data.ok) {
      document.getElementById("token-display").textContent = data.data.qr_token;
      document.getElementById("expires").textContent =
        data.data.expires_at || "-";
      document.getElementById("qr-image").src =
        `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data.data.qr_token)}`;
      document.getElementById("qr-result").classList.add("show");
    } else {
      alert(data.error || "Gagal generate QR");
    }
  } catch (err) {
    console.error("Generate QR failed:", err);
    alert("Gagal generate QR: " + err.message);
  }
}

/* ── Start Camera Scanner ──────────────────── */
function startScanner() {
  if (html5QrCode) html5QrCode.clear();
  html5QrCode = new Html5Qrcode("reader");

  html5QrCode
    .start(
      { facingMode: "environment" },
      { fps: 15, qrbox: 220 },
      (decodedText) => {
        html5QrCode.stop();
        checkinWithToken(decodedText);
      },
      (err) => {
        /* scanning errors, intentionally ignored */
      },
    )
    .catch((err) => alert("Gagal memulai kamera: " + err));
}

/* ── Check-in with Token ───────────────────── */
async function checkinWithToken(qr_token) {
  const payload = {
    user_id: document.getElementById("user_id").value || "2023xxxx",
    device_id: DEVICE_ID,
    course_id: document.getElementById("course_id")?.value || "cloud-101",
    session_id: document.getElementById("session_id")?.value || "sesi-02",
    qr_token,
    ts: new Date().toISOString(),
  };

  const box = document.getElementById("status-result");
  box.className = "status-box";
  box.textContent = "Memproses check-in...";

  try {
    const res = await fetch(`${BASE_URL}?path=presence/checkin`, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Check-in error ${res.status}`);

    const data = await handleResponse(res);

    box.textContent = JSON.stringify(data, null, 2);
    box.className = "status-box " + (data.ok ? "success" : "error");
  } catch (err) {
    box.textContent = "Error: " + err.message;
    box.className = "status-box error";
    console.error("Checkin failed:", err);
  }
}

/* ── Manual Check-in (Test) ────────────────── */
function manualCheckin() {
  checkinWithToken("MANUAL-TEST-123");
}

/* ── Check Status ──────────────────────────── */
async function checkStatus() {
  const user_id = document.getElementById("user_id")?.value || "2023xxxx";
  const course_id = document.getElementById("course_id")?.value || "cloud-101";
  const session_id = document.getElementById("session_id")?.value || "sesi-02";

  const url =
    `${BASE_URL}?path=presence/status` +
    `&user_id=${encodeURIComponent(user_id)}` +
    `&course_id=${encodeURIComponent(course_id)}` +
    `&session_id=${encodeURIComponent(session_id)}`;

  const box = document.getElementById("status-result");
  box.className = "status-box";
  box.textContent = "Mengambil data...";

  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    if (!res.ok) throw new Error(`Status error ${res.status}`);
    const data = await handleResponse(res);

    box.textContent = JSON.stringify(data, null, 2);
    box.className = "status-box " + (data.ok ? "success" : "error");
  } catch (err) {
    box.textContent = "Error: " + err.message;
    box.className = "status-box error";
    console.error("Check status failed:", err);
  }
}
