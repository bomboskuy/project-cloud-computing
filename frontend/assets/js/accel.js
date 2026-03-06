let accelInterval = null;

async function sendAccelBatch() {
  const samples = [];
  for (let i = 0; i < 5; i++) {
    samples.push({
      t: new Date(Date.now() - (4 - i) * 200).toISOString(),
      x: (Math.random() * 0.8 - 0.4).toFixed(3),
      y: (Math.random() * 0.8 - 0.4).toFixed(3),
      z: (9.7 + Math.random() * 0.6 - 0.3).toFixed(3),
    });
  }

  const res = await fetch(`${BASE_URL}/telemetry/accel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_id: DEVICE_ID,
      ts: new Date().toISOString(),
      samples: samples,
    }),
  });
  const data = await handleResponse(res);

  const log = document.getElementById("log");
  const time = new Date().toLocaleTimeString();
  log.innerHTML += `<div class="mb-1 ${data.ok ? "text-green-600" : "text-red-600"}">${time} → ${data.ok ? "OK (" + data.data.accepted + ")" : data.error}</div>`;
  log.scrollTop = log.scrollHeight;

  const last = samples[samples.length - 1];
  document.getElementById("x").textContent = last.x;
  document.getElementById("y").textContent = last.y;
  document.getElementById("z").textContent = last.z;
}

function toggleAccel() {
  const btn = document.getElementById("btnAccel");
  if (accelInterval) {
    clearInterval(accelInterval);
    accelInterval = null;
    btn.textContent = "▶ START KIRIM BATCH (2.5 detik)";
  } else {
    accelInterval = setInterval(sendAccelBatch, 2500);
    btn.textContent = "⏹ STOP KIRIM BATCH";
    sendAccelBatch();
  }
}
