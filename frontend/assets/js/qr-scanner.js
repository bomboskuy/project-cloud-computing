let html5QrCode = null;

async function generateQR() {
  const payload = {
    course_id: document.getElementById("course_id").value,
    session_id: document.getElementById("session_id").value,
    ts: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${BASE_URL}?path=presence/qr/generate`, {
      method: "POST",
      redirect: "follow", // Penting untuk GAS
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // KUNCI: hindari preflight CORS
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error ${res.status}: ${errorText}`);
    }

    const data = await handleResponse(res);

    if (data.ok) {
      document.getElementById("qr-result").classList.remove("hidden");

      document.getElementById("token-display").textContent = data.data.qr_token;

      document.getElementById("expires").textContent = data.data.expires_at;

      document.getElementById("qr-image").src =
        `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(data.data.qr_token)}`;
    } else {
      showAlert(data.error || "Gagal generate QR (response tidak OK)", "error");
    }
  } catch (err) {
    console.error("Generate QR failed:", err);
    showAlert("Gagal generate QR: " + (err.message || err), "error");
  }
}

/* =========================
   START QR SCANNER
========================= */
function startScanner() {
  if (html5QrCode) html5QrCode.clear();

  html5QrCode = new Html5Qrcode("reader");

  const config = { fps: 15, qrbox: 250 };

  html5QrCode
    .start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        html5QrCode.stop();
        checkinWithToken(decodedText);
      },
      (errorMessage) => {
        // Optional: console.log("QR scan error:", errorMessage);
      },
    )
    .catch((err) => {
      console.error("Start scanner failed:", err);
      showAlert("Gagal memulai kamera: " + err, "error");
    });
}

/* =========================
   CHECKIN DENGAN TOKEN
========================= */
async function checkinWithToken(qr_token) {
  const payload = {
    user_id: document.getElementById("user_id").value || "2023xxxx",
    device_id: DEVICE_ID,
    course_id: document.getElementById("course_id")?.value || "cloud-101",
    session_id: document.getElementById("session_id")?.value || "sesi-02",
    qr_token: qr_token,
    ts: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${BASE_URL}?path=presence/checkin`, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // KUNCI
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Check-in error ${res.status}: ${errorText}`);
    }

    const data = await handleResponse(res);

    showAlert(
      data.ok ? "Check-in BERHASIL!" : data.error || "Check-in gagal",
      data.ok ? "success" : "error",
    );
  } catch (err) {
    console.error("Checkin failed:", err);
    showAlert("Checkin gagal: " + (err.message || err), "error");
  }
}

/* =========================
   CHECKIN MANUAL (untuk testing)
========================= */
async function manualCheckin() {
  checkinWithToken("MANUAL-TEST-123");
}

/* =========================
   CEK STATUS PRESENSI
========================= */
async function checkStatus() {
  const user_id = document.getElementById("user_id").value || "2023xxxx";
  const course_id = document.getElementById("course_id")?.value || "cloud-101";
  const session_id = document.getElementById("session_id")?.value || "sesi-02";

  try {
    const url = `${BASE_URL}?path=presence/status&user_id=${encodeURIComponent(user_id)}&course_id=${encodeURIComponent(course_id)}&session_id=${encodeURIComponent(session_id)}`;

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Status error ${res.status}: ${errorText}`);
    }

    const data = await handleResponse(res);

    const el = document.getElementById("status-result");

    el.innerHTML = data.ok
      ? `<span class="text-green-600 font-bold">✅ ${data.data.status}</span><br><small>Last: ${data.data.last_ts || "-"}</small>`
      : `<span class="text-red-600">❌ ${data.error || "Gagal memuat status"}</span>`;
  } catch (err) {
    console.error("Check status failed:", err);
    showAlert("Status gagal: " + (err.message || err), "error");
  }
}
