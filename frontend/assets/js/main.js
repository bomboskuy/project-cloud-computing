const BASE_URL =
  "https://script.google.com/macros/s/AKfycbxG6XxAak-2cyh5WxLc6XR7o0hQKal7KoUYzqWpQZCC7g-APpXtxQe0HtdDWYqsioZUdg/exec";

const DEVICE_ID = localStorage.getItem("device_id") || crypto.randomUUID();
localStorage.setItem("device_id", DEVICE_ID);

async function handleResponse(res) {
  const data = await res.json();
  return data;
}

function showAlert(msg, type = "info") {
  alert(msg);
}
