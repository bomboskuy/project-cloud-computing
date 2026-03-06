<?php require 'config.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloud Computing</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-gradient-to-br from-sky-100 to-indigo-100 min-h-screen pb-24">

    <div class="max-w-5xl mx-auto p-6">
        <!-- Header -->
        <div class="text-center mb-12 pt-8">
            <h1 class="text-5xl font-bold mb-3 text-indigo-700">☁️ Komputasi Awan</h1>
        </div>

        <!-- MENU SUSUN KE BAWAH -->
        <div class="grid grid-cols-1 gap-8">
            <a href="presence.php" class="card p-8 flex items-center gap-6 group">
                <div class="text-6xl transition-transform group-hover:scale-110">📱</div>
                <div>
                    <h2 class="text-2xl font-bold text-indigo-700">Presensi QR Dinamis</h2>
                    <p class="text-slate-600 mt-1">Generate • Scan • Check-in • Status</p>
                </div>
            </a>

            <a href="telemetry.php" class="card p-8 flex items-center gap-6 group">
                <div class="text-6xl transition-transform group-hover:scale-110">📊</div>
                <div>
                    <h2 class="text-2xl font-bold text-indigo-700">Accelerometer Telemetry</h2>
                    <p class="text-slate-600 mt-1">Kirim Batch + Tampil Latest</p>
                </div>
            </a>

            <a href="gps.php" class="card p-8 flex items-center gap-6 group">
                <div class="text-6xl transition-transform group-hover:scale-110">📍</div>
                <div>
                    <h2 class="text-2xl font-bold text-indigo-700">GPS Tracking + Peta</h2>
                    <p class="text-slate-600 mt-1">Live Marker + Polyline</p>
                </div>
            </a>
        </div>

        <!-- INFO BACKEND & API CONTRACT -->
        <div class="text-center mt-16 mb-8">
            <div class="inline-block bg-white/70 backdrop-blur-md px-8 py-4 rounded-3xl border border-indigo-100 shadow">
                <p class="text-slate-700 font-medium">
                    Backend: <span class="text-indigo-700">Google Apps Script + Google Sheets</span>
                </p>
                <p class="text-xs text-slate-500 mt-1 tracking-wider">
                    API Contract Simple v1
                </p>
            </div>
        </div>
    </div>

    <!-- FOOTER NAVIGATION (ditambah HOME) -->
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