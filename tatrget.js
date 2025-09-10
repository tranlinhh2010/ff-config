/*
 * Surge Aim Assist Hook (Advanced)
 * Bundle: com.dts.freefireth
 * Không dùng số cứng → phân tích từ API response
 */

function parseConfig(raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Kalman filter để smooth aim
class Kalman1D {
  constructor(r = 0.01, q = 3) {
    this.r = r; this.q = q;
    this.p = 1; this.x = 0;
  }
  filter(z) {
    this.p += this.q;
    const k = this.p / (this.p + this.r);
    this.x += k * (z - this.x);
    this.p *= (1 - k);
    return this.x;
  }
}

// Aim assist logic
function aimAssist(targets, opts = {smooth: 0.5, priority: "nearest"}) {
  if (!Array.isArray(targets) || targets.length === 0) return null;

  // chọn mục tiêu theo priority
  let chosen;
  if (opts.priority === "nearest") {
    chosen = targets.reduce((a, b) => (a.dist < b.dist ? a : b));
  } else if (opts.priority === "head") {
    chosen = targets.find(t => t.type === "head") || targets[0];
  } else {
    chosen = targets[0];
  }

  // smooth bằng Kalman
  const kx = new Kalman1D();
  const ky = new Kalman1D();

  return {
    x: kx.filter(chosen.x),
    y: ky.filter(chosen.y),
    id: chosen.id
  };
}

// Surge entrypoint
if ($response && $response.body) {
  let data = parseConfig($response.body);

  if (data && data.targets) {
    let locked = aimAssist(data.targets, {smooth: 0.6, priority: "head"});
    if (locked) {
      console.log("🎯 Locked on:", locked);
      // Nếu muốn, có thể chỉnh response gửi về
      data.lockedTarget = locked;
      $done({body: JSON.stringify(data)});
    } else {
      $done({});
    }
  } else {
    $done({});
  }
} else {
  $done({});
}
