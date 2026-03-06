<?php require 'config.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accelerometer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="assets/js/main.js"></script>
    <script src="assets/js/accel.js"></script>
</head>
<body class="bg-gradient-to-br from-sky-100 to-indigo-100 min-h-screen pb-24">
    <div class="max-w-xl mx-auto p-6">
        <h1 class="text-3xl font-bold mb-8 text-center text-indigo-700">Accelerometer Telemetry</h1>
        
        <div class="card p-8">
            <div class="grid grid-cols-3 gap-6 text-center mb-10">
                <div><div id="x" class="text-5xl font-mono font-bold text-blue-600">0.00</div><div class="text-xs tracking-widest text-gray-500 mt-1">X</div></div>
                <div><div id="y" class="text-5xl font-mono font-bold text-blue-600">0.00</div><div class="text-xs tracking-widest text-gray-500 mt-1">Y</div></div>
                <div><div id="z" class="text-5xl font-mono font-bold text-blue-600">0.00</div><div class="text-xs tracking-widest text-gray-500 mt-1">Z</div></div>
            </div>

            <button onclick="toggleAccel()" id="btnAccel" 
                    class="btn-primary w-full py-6 text-xl font-semibold">▶ START KIRIM BATCH (2.5 detik)</button>

            <div id="log" class="mt-8 bg-gray-100 p-5 rounded-2xl text-xs font-mono h-72 overflow-auto"></div>
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