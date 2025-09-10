/****************************************
 * Free Fire VN Inject for Loon (Advanced Direct Mode)
 * Adapted for Loon script environment
 ****************************************/

const GAME_BUNDLE = "com.dts.freefireth";

let state = {
  injectCount: 0,
  retryCount: 0,
  maxRetries: 3,
};

function parseBuild(build) {
  let config = {
    sensitivity: 80,
    aimlock: { enabled: false, level: 1 },
    touchBoost: { enabled: false, strength: "medium" },
    dpi: "normal",
    layer: "user",
    recoil: {
      enabled: false,
      level: 0,
      weaponType: "generic",
      pattern: "linear",
      fireRate: 1.0,
    },
    aimAssist: {
      enabled: false,
      range: 50,
      smoothness: 0.5,
      priority: "body",
      fovLimit: 90,
    },
    fov: 90,
  };

  if (/sensi(\d+)/.test(build)) {
    config.sensitivity = parseInt(RegExp.$1);
  }
  if (/aimlock(\d+)/.test(build)) {
    config.aimlock = { enabled: true, level: Math.min(parseInt(RegExp.$1), 5) };
  }
  if (/touchboost(\w+)/.test(build)) {
    config.touchBoost = { enabled: true, strength: RegExp.$1 || "medium" };
  }
  if (/dpi(\d+)/.test(build)) {
    config.dpi = `dpi-${Math.max(100, Math.min(parseInt(RegExp.$1), 2000))}`;
  }
  if (/layer=(\w+)/.test(build)) {
    config.layer = RegExp.$1;
  }
  if (/recoil(\d+)/.test(build)) {
    config.recoil.enabled = true;
    config.recoil.level = Math.min(parseInt(RegExp.$1), 100);
  }
  if (/weapontype=(\w+)/.test(build)) {
    config.recoil.weaponType = RegExp.$1;
  }
  if (/pattern=(\w+)/.test(build)) {
    config.recoil.pattern = RegExp.$1;
  }
  if (/firerate(\d+\.?\d*)/.test(build)) {
    config.recoil.fireRate = parseFloat(RegExp.$1);
  }
  if (/aimassist(\d+)/.test(build)) {
    config.aimAssist.enabled = true;
    config.aimAssist.range = parseInt(RegExp.$1);
  }
  if (/smoothness(\d+\.?\d*)/.test(build)) {
    config.aimAssist.smoothness = Math.max(0.0, Math.min(parseFloat(RegExp.$1), 1.0));
  }
  if (/priority=(\w+)/.test(build)) {
    config.aimAssist.priority = RegExp.$1;
  }
  if (/fovlimit(\d+)/.test(build)) {
    config.aimAssist.fovLimit = parseInt(RegExp.$1);
  }
  if (/fov(\d+)/.test(build)) {
    config.fov = parseInt(RegExp.$1);
  }

  return config;
}

function calculateRecoilCompensation(config) {
  let recoilCompensation = config.recoil.level;

  const weaponModifiers = {
    AR: 1.2,
    SMG: 1.0,
    Sniper: 0.8,
    Shotgun: 0.9,
    generic: 1.0,
  };

  const patternModifiers = {
    linear: 1.0,
    curve: 0.9,
    random: 1.3,
  };

  recoilCompensation *= (weaponModifiers[config.recoil.weaponType] || 1.0);
  recoilCompensation *= (patternModifiers[config.recoil.pattern] || 1.0);
  recoilCompensation *= config.recoil.fireRate;

  return Math.round(recoilCompensation);
}

function calculateAimAssist(config) {
  let aimAssistStrength = config.aimAssist.range * (1 - config.aimAssist.smoothness);

  const priorityModifiers = {
    head: 1.5,
    body: 1.0,
    nearest: 0.8,
  };

  aimAssistStrength *= (priorityModifiers[config.aimAssist.priority] || 1.0);

  if (config.aimAssist.fovLimit < config.fov) {
    aimAssistStrength *= (config.aimAssist.fovLimit / config.fov);
  }

  return Math.round(aimAssistStrength);
}

function buildPayload(req) {
  state.injectCount++;

  // Loon exposes $argument; fallback to query param or default
  let build = (typeof $argument !== "undefined" && $argument.build_name) ||
              (req && req.url && new URL(req.url).searchParams.get("build_name")) ||
              `dynamic_build_${state.injectCount}`;
  let deviceId = (typeof $argument !== "undefined" && $argument.device_id) ||
                 (req && req.url && new URL(req.url).searchParams.get("device_id")) ||
                 "unknown";

  let config = parseBuild(build);

  let adaptiveSensi = config.sensitivity + state.injectCount * 2;
  let recoilCompensation = config.recoil.enabled ? calculateRecoilCompensation(config) : 0;
  let aimAssistStrength = config.aimAssist.enabled ? calculateAimAssist(config) : 0;

  let payload = {
    bundle: GAME_BUNDLE,
    build,
    config,
    adaptiveSensi,
    recoilCompensation,
    aimAssistStrength,
    injectCount: state.injectCount,
    retryCount: state.retryCount,
    timestamp: Date.now(),
    device: deviceId,
    performance: {
      latency: Math.floor(Math.random() * 50),
      fpsBoost: config.touchBoost.enabled ? 10 : 0,
    },
  };

  return payload;
}

function respondJSON(obj) {
  // Loon expects $done with response shape {body, headers (optional)}
  return {
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
      "X-Inject-Mode": "advanced-direct",
      "X-Device-ID": obj.device || "unknown",
    },
  };
}

function inject(req) {
  try {
    const payload = buildPayload(req);
    return respondJSON(payload);
  } catch (e) {
    // Log error via Loon notification
    if (typeof $notification !== "undefined") {
      $notification.post("Inject Error", e.message || "unknown error", JSON.stringify(e));
    }
    throw e;
  }
}

function retryInject(req) {
  if (state.retryCount >= state.maxRetries) {
    return {
      body: JSON.stringify({
        error: "MaxRetriesExceeded",
        detail: `Failed after ${state.maxRetries} attempts`,
        injectCount: state.injectCount,
        timestamp: Date.now(),
      }),
    };
  }
  state.retryCount++;
  return inject(req);
}

/* Entry point: Loon will call this script with $request available.
   If you're using it as an http-request script, Loon passes $request.
*/
try {
  if (typeof $request !== "undefined" && $request && $request.url) {
    $done(inject($request));
  } else {
    $done({
      body: JSON.stringify({
        error: "InvalidRequest",
        detail: "No valid URL provided",
        timestamp: Date.now(),
      }),
    });
  }
} catch (e) {
  // Attempt retry path then return error
  try {
    $done(retryInject(typeof $request !== "undefined" ? $request : null));
  } catch (ee) {
    $done({
      body: JSON.stringify({
        error: "UnhandledError",
        detail: String(ee.message || ee),
        timestamp: Date.now(),
      }),
    });
  }
}
