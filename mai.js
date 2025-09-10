/*
 * Free Fire API Debug Capture
 * Bắt mọi request/response để tìm API cảm ứng
 */

let url = $request.url || "";
let body = $response.body || "";

console.log("🌐 URL: " + url);

if (body) {
  console.log("📦 Body preview: " + body.slice(0, 200));
}

// Lọc theo từ khóa quan trọng
const keywords = ["sensi", "touch", "gyro", "control"];
if (keywords.some(k => url.toLowerCase().includes(k) || body.toLowerCase().includes(k))) {
  $notification.post(
    "🎮 Free Fire API",
    "Đã bắt được endpoint cảm ứng",
    url
  );
}

$done({});
