/*
 Smart Sensi Engine
 - Buff sensitivity +60%
 - Giảm input delay
 - Auto scale theo device
*/
let body = $response.body;
try {
    let json = JSON.parse(body);
    if (json) {
        let base = json.sensitivity || 100;

        // Nhận diện model iPhone
        let device = $device.model || "Unknown";

        // Áp buff tuỳ máy
        if (device.includes("iPhone 13") || device.includes("iPhone 14")) {
            json.sensitivity = base * 1.65;
        } else if (device.includes("iPad")) {
            json.sensitivity = base * 1.55;
        } else {
            json.sensitivity = base * 1.6;
        }

        // Giảm độ trễ cảm ứng
        json.touchResponse = Math.max((json.touchResponse || 20) - 5, 5);

        // Tăng tốc độ xoay tâm
        json.aimSpeed = (json.aimSpeed || 1.0) * 1.15;
    }
    $done({ body: JSON.stringify(json) });
} catch (e) {
    $done({});
}
