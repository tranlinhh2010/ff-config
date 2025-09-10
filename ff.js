/*
 * Free Fire API Capture + Notify
 * Bắt API khi vào game, log + gửi thông báo
 */

let url = $request.url || "";
let body = $response.body || "";

function containsKeywords(text) {
  const keywords = ["touch", "sensi", "gyro", "control"];
  return keywords.some(k => text.toLowerCase().includes(k));
}

if (containsKeywords(url) || containsKeywords(body)) {
  console.log("🎯 [FreeFire API] URL: " + url);

  let preview = body.slice(0, 150);
  console.log("📦 Preview: " + preview);

  // Gửi thông báo ra ngoài
  $notification.post(
    "🎮 Free Fire API Capture",
    "Phát hiện API cảm ứng/nhạy",
    "URL: " + url + "\nPreview: " + preview
  );
}

$done({});
