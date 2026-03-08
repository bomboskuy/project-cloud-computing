
const BASE_URL =
  "https://script.google.com/macros/s/AKfycbxG6XxAak-2cyh5WxLc6XR7o0hQKal7KoUYzqWpQZCC7g-APpXtxQe0HtdDWYqsioZUdg/exec";

const DEVICE_ID = (() => {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id =
      "dev-" +
      (crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 10));
    localStorage.setItem("device_id", id);
  }
  return id;
})();

async function handleResponse(res) {
  return await res.json();
}

/** Append a line to a .log-box element */
function logLine(boxId, msg, type = "") {
  const box = document.getElementById(boxId);
  if (!box) return;
  const line = document.createElement("div");
  if (type) line.className = `log-${type}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}
