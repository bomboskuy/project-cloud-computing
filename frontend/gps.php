<?php require 'config.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPS Tracking</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="assets/js/gps.js"></script>
    <style>#map { height: 420px; }</style>
</head>
<body class="bg-gradient-to-br from-sky-100 to-indigo-100 min-h-screen pb-24">
    <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-3xl font-bold mb-6 text-center text-indigo-700">GPS Tracking + Peta</h1>
        
        <div class="card overflow-hidden">
            <div id="map"></div>
            
            <div class="p-6 flex gap-4">
                <button onclick="startGPS()" class="flex-1 btn-primary py-5 text-lg">START LOG GPS</button>
                <button onclick="stopGPS()" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-semibold text-lg">STOP</button>
            </div>
        </div>
    </div>

    <!-- FOOTER NAVIGATION -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl">
        <div class="max-w-5xl mx-auto grid grid-cols-4 py-3">
            <a href="index.php" class="flex flex-col items-center text-indigo-600 active:scale-95 transition">
                <span class="text-3xl mb-1">🏠</span>
                <span class="text-xs font-semibold">Home</span>
            </a>
            <a href="presence.php" class="flex flex-col items-center text-indigo-600 active:scale-95 transition">
                <span class="text-3xl mb-1">📱</span>
                <span class="text-xs font-semibold">Presensi</span>
            </a>
            <a href="telemetry.php" class="flex flex-col items-center text-indigo-600 active:scale-95 transition">
                <span class="text-3xl mb-1">📊</span>
                <span class="text-xs font-semibold">Accelerometer</span>
            </a>
            <a href="gps.php" class="flex flex-col items-center text-indigo-600 active:scale-95 transition">
                <span class="text-3xl mb-1">📍</span>
                <span class="text-xs font-semibold">GPS Tracking</span>
            </a>
        </div>
    </footer>

</body>
</html>