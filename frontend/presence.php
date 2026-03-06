<?php require 'config.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presensi QR Dinamis</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"></script>
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="assets/js/main.js"></script>
    <script src="assets/js/qr-scanner.js"></script>
</head>
<body class="bg-gradient-to-br from-sky-100 to-indigo-100 min-h-screen pb-24">
    <div class="max-w-2xl mx-auto p-6">
        <h1 class="text-3xl font-bold text-center mb-8 text-indigo-700">Presensi QR Dinamis</h1>

        <!-- TAB -->
        <div class="flex border-b mb-8 bg-white rounded-t-3xl overflow-hidden">
            <button onclick="showTab(0)" id="tab0" class="tab-btn active flex-1 py-4">Dosen (Generate QR)</button>
            <button onclick="showTab(1)" id="tab1" class="tab-btn flex-1 py-4">Mahasiswa (Scan & Check-in)</button>
        </div>

        <!-- DOSEN MODE -->
        <div id="content-0" class="card p-8">
            <input id="course_id" value="cloud-101" class="w-full p-4 border border-gray-300 rounded-2xl mb-3 focus:outline-none focus:border-blue-500">
            <input id="session_id" value="sesi-02" class="w-full p-4 border border-gray-300 rounded-2xl mb-6 focus:outline-none focus:border-blue-500">
            <button onclick="generateQR()" class="btn-primary w-full py-4 text-lg">GENERATE QR TOKEN</button>

            <div id="qr-result" class="hidden mt-8 text-center qr-container">
                <p class="text-sm text-gray-500 mb-2">QR Token (Scan ini di HP mahasiswa)</p>
                <p id="token-display" class="text-4xl font-mono font-bold text-blue-600 mb-4"></p>
                <img id="qr-image" class="mx-auto rounded-2xl shadow">
                <p class="text-xs text-gray-400 mt-6">Expired: <span id="expires" class="font-medium"></span></p>
            </div>
        </div>

        <!-- MAHASISWA MODE -->
        <div id="content-1" class="card p-8 hidden">
            <div id="reader" class="w-full aspect-square"></div>
            <button onclick="startScanner()" class="btn-primary w-full py-4 mt-6 text-lg">MULAI SCAN KAMERA</button>

            <div class="mt-8">
                <input id="user_id" value="2023xxxx" placeholder="Masukkan NIM / user_id" 
                       class="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500">
                <button onclick="manualCheckin()" class="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-2xl font-semibold">
                    CHECK-IN MANUAL (Test)
                </button>
            </div>
        </div>

        <!-- STATUS -->
        <div class="card p-8 mt-8">
            <h3 class="font-semibold mb-4 text-indigo-700">Cek Status Presensi</h3>
            <button onclick="checkStatus()" class="btn-primary w-full py-4">CEK STATUS SEKARANG</button>
            <div id="status-result" class="status-box mt-6 text-sm"></div>
        </div>
    </div>

    <script>
        function showTab(n) {
            document.getElementById('content-0').classList.toggle('hidden', n !== 0);
            document.getElementById('content-1').classList.toggle('hidden', n !== 1);
            document.getElementById('tab0').classList.toggle('active', n === 0);
            document.getElementById('tab1').classList.toggle('active', n === 1);
        }
        showTab(0); // default tab dosen
    </script>

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