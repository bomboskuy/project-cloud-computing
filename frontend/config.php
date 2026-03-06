<?php
define('GAS_BASE_URL', 'https://script.google.com/macros/s/AKfycbxG6XxAak-2cyh5WxLc6XR7o0hQKal7KoUYzqWpQZCC7g-APpXtxQe0HtdDWYqsioZUdg/exec');
define('DEFAULT_DEVICE_ID', 'dev-' . substr(md5($_SERVER['REMOTE_ADDR'] ?? 'unknown' . time()), 0, 8));

header('Access-Control-Allow-Origin: *');
?>