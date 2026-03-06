let map,
  marker,
  polyline,
  watchId = null;
let routePoints = [];

function initMap() {
  map = L.map("map").setView([-7.2575, 112.7521], 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  marker = L.marker([-7.2575, 112.7521]).addTo(map);
  polyline = L.polyline([], { color: "#2563eb", weight: 6 }).addTo(map);
}

async function sendGPS(lat, lng) {
  await fetch(`${BASE_URL}/telemetry/gps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_id: DEVICE_ID,
      ts: new Date().toISOString(),
      lat: lat,
      lng: lng,
      accuracy_m: 10,
    }),
  });
}

function startGPS() {
  if (!navigator.geolocation) return alert("Browser tidak support GPS");
  if (!map) initMap();

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      marker.setLatLng([latitude, longitude]);
      map.flyTo([latitude, longitude], 17);
      routePoints.push([latitude, longitude]);
      polyline.setLatLngs(routePoints);
      sendGPS(latitude, longitude);
    },
    (err) => alert("GPS Error: " + err.message),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
    },
  );
}

function stopGPS() {
  if (watchId) navigator.geolocation.clearWatch(watchId);
}
