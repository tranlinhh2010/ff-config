// Buff Sensi +20%
let body = $response.body;
try {
    let json = JSON.parse(body);
    if (json && json.sensitivity) {
        json.sensitivity = json.sensitivity * 1.2;
    }
    $done({ body: JSON.stringify(json) });
} catch (e) {
    $done({});
}
