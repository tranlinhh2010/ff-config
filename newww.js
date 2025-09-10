/**
 * aim_simulator.js
 * - Mô phỏng aim-assist logic (offline). Chạy bằng Node.js hoặc trong Browser console.
 * - Không tương tác hay hướng dẫn hook/inject game thực tế.
 */

// Vector2 tiện dụng
class Vector2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  copy() { return new Vector2(this.x, this.y); }
  add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
  mul(s) { return new Vector2(this.x * s, this.y * s); }
  len() { return Math.hypot(this.x, this.y); }
  norm() { let L = this.len() || 1; return new Vector2(this.x / L, this.y / L); }
  lerp(target, t) { return this.add(target.sub(this).mul(t)); }
}

// Simple Kalman filter for 2D position (very small demo)
class Kalman2D {
  constructor(q = 0.01, r = 0.1) {
    // Process noise q, measurement noise r
    this.q = q; this.r = r;
    this.x = new Vector2(0,0); // state estimate
    this.p = [[1,0],[0,1]];    // covariance (2x2)
  }
  update(measure) {
    // Prediction step (identity motion model for simplicity)
    // p = p + qI
    this.p[0][0] += this.q; this.p[1][1] += this.q;
    // Kalman gain K = p * (p + rI)^-1 -> since scalar-ish, we do elementwise approx
    const s00 = this.p[0][0] + this.r;
    const s11 = this.p[1][1] + this.r;
    const k00 = this.p[0][0] / s00;
    const k11 = this.p[1][1] / s11;
    // update state x = x + K*(z - x)
    this.x.x += k00 * (measure.x - this.x.x);
    this.x.y += k11 * (measure.y - this.x.y);
    // update covariance p = (I - K) p
    this.p[0][0] *= (1 - k00);
    this.p[1][1] *= (1 - k11);
    return this.x.copy();
  }
}

// Target class for simulation
class Target {
  constructor(id, pos, vel = new Vector2(0,0), isHead = false) {
    this.id = id;
    this.pos = pos; this.vel = vel; this.isHead = isHead;
  }
  step(dt = 1) {
    this.pos = this.pos.add(this.vel.mul(dt));
  }
  measure(noise = 0.5) {
    // Simulated noisy measurement
    const nx = this.pos.x + (Math.random() - 0.5) * noise;
    const ny = this.pos.y + (Math.random() - 0.5) * noise;
    return new Vector2(nx, ny);
  }
}

// AimAssist logic (simulation-only)
class AimAssist {
  constructor(settings = {}) {
    this.fov = settings.fov || 90; // degrees (for simulation treat as pixel-based limit)
    this.range = settings.range || 300; // pixels
    this.smoothness = settings.smoothness ?? 0.4; // 0..1 (higher = slower)
    this.priority = settings.priority || 'body'; // head/body/nearest
    this.recoilCompensation = settings.recoilCompensation || 0;
    this.kalmanMap = new Map(); // per-target Kalman filter
    this.currentAim = new Vector2(0,0); // aim position
  }

  _scoreTarget(target, playerPos) {
    // Compute distance-based score, head gets multiplier
    const d = target.pos.sub(playerPos).len();
    if (d > this.range) return -Infinity;
    let score = 1 / (1 + d);
    if (this.priority === 'head' && target.isHead) score *= 2.0;
    if (this.priority === 'nearest') score *= 1.0;
    return score;
  }

  acquireTarget(targets, playerPos) {
    let best = null; let bestScore = -Infinity;
    for (const t of targets) {
      const s = this._scoreTarget(t, playerPos);
      if (s > bestScore) { bestScore = s; best = t; }
    }
    return best;
  }

  // Estimate target position using Kalman (or raw measure)
  estimateTargetPos(target, measurement) {
    if (!this.kalmanMap.has(target.id)) {
      this.kalmanMap.set(target.id, new Kalman2D(0.02, 0.5));
      // initialize to measurement
      const k = this.kalmanMap.get(target.id);
      k.x = measurement.copy();
    }
    return this.kalmanMap.get(target.id).update(measurement);
  }

  // Compute desired aim (includes simple recoil compensation offset)
  computeDesiredAim(targetEst, playerPos) {
    // Recoil compensation as a vertical offset (simple demo)
    const recoilOffset = new Vector2(0, -this.recoilCompensation);
    return targetEst.add(recoilOffset);
  }

  // Apply smoothing: lerp from currentAim to desiredAim
  smoothAim(desiredAim) {
    const t = 1 - Math.exp(-5 * (1 - this.smoothness)); // convert smoothness to lerp factor
    this.currentAim = this.currentAim.lerp(desiredAim, t);
    return this.currentAim.copy();
  }

  stepCycle(targets, playerPos) {
    // Acquire
    const target = this.acquireTarget(targets, playerPos);
    if (!target) return { aim: this.currentAim.copy(), target: null };

    // Measure & estimate
    const meas = target.measure(1.0);
    const est = this.estimateTargetPos(target, meas);

    // Desired aim & smooth
    const desired = this.computeDesiredAim(est, playerPos);
    const smoothed = this.smoothAim(desired);

    return { aim: smoothed, targetId: target.id, rawMeasure: meas, est };
  }
}

/* -------- Demo simulation -------- */
function demoSimulation() {
  // Player starts at center
  const playerPos = new Vector2(400, 300);
  // Create targets: moving and stationary
  const targets = [
    new Target('t1', new Vector2(600, 320), new Vector2(-0.6, 0), false),
    new Target('t2', new Vector2(700, 200), new Vector2(-0.4, 0.2), true), // head target (higher priority)
    new Target('t3', new Vector2(200, 500), new Vector2(0.5, -0.2), false),
  ];

  const aim = new AimAssist({
    fov: 90,
    range: 500,
    smoothness: 0.35,
    priority: 'head',
    recoilCompensation: 4, // pixels upward
  });

  // Initialize current aim at player facing center
  aim.currentAim = new Vector2(420, 310);

  console.log("Simulating aim-assist for 80 steps...\n");
  for (let step = 0; step < 80; step++) {
    // move targets
    targets.forEach(t => t.step(1));
    const out = aim.stepCycle(targets, playerPos);
    console.log(`[${String(step).padStart(2,'0')}] target=${out.targetId || 'none'} aim=(${out.aim.x.toFixed(1)},${out.aim.y.toFixed(1)}) est=(${out.est ? out.est.x.toFixed(1) : 'n/a'},${out.est ? out.est.y.toFixed(1) : 'n/a'})`);
  }
}

// Run demo if this file executed directly (Node)
if (typeof require !== "undefined" && require.main === module) {
  demoSimulation();
}

// Export for reuse in other modules
module.exports = { Vector2, Kalman2D, Target, AimAssist, demoSimulation };
