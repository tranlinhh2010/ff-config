/*
 * Free Fire Touch API Logger for Surge
 * Mục đích: log URL API cảm ứng (touch sensitivity) mà game gọi.
 */

let url = $request.url;
let body = $response.body;

console.log("[FreeFire API] URL Cảm ứng: " + url);

// Nếu có body thì in thử trước 200 ký tự để xem có config cảm ứng
if (body) {
  try {
    console.log("[FreeFire API] Response preview: " + body.slice(0, 200));
  } catch (e) {
    console.log("[FreeFire API] Body decode error");
  }
}

$done({});
