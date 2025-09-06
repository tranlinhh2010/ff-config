/****************************************
 * Free Fire VN Inject Script
 * - Hỗ trợ đọc argument inline
 * - Build code / range / secure flag
 ****************************************/

const GAME_BUNDLE = "com.dts.freefireth";

// Cache inject state
let state = {
  count: 0,
  last: "init",
};

function inject(req) {
  state.count++;

  // ==== Đọc argument từ config ====
  let build = $argument.build_name || "default_build";
  let range = $argument.range || "70-100";
  let secure = $argument["uncrack.list"] === "true";

  // ==== Cấu hình profile ====
  let profile = {
    mouse: "enabled",
    touch: "smooth",
    dpi: "adaptive",
    aimlock: "on",
    buff: "system+apn",
  };

  return {
    body: JSON.stringify({
      bundle: GAME_BUNDLE,
      build,
      range,
      secure,
      profile,
      count: state.count,
      timestamp: Date.now(),
    }),
    headers: {
      "Content-Type": "application/json",
      "X-Inject-Mode": "multi-layer",
    },
  };
}

// ====== ENTRY POINT ======
if ($request && $request.url) {
  try {
    let result = inject($request);
    $done(result);
  } catch (e) {
    $done({
      body: JSON.stringify({
        error: "InjectError",
        detail: e.message,
      }),
    });
  }
} else {
  $done({});
}
