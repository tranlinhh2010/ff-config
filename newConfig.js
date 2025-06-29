const uuid = "FAKE-UUID-12345678";
const model = "iPhone13,4";
const os = "iOS 17.5.1";

// Thời gian phản hồi cảm ứng (ms)
const latencyProfile = {
  tap: 6,
  hold: 12,
  drag: 9,
  flick: 4
};

// Cảm biến mô phỏng chuyển động tay
const gyroAssist = {
  enabled: true,
  stabilityThreshold: 0.85,
  dynamicAimOffset: "auto-correct",
  jitterCompensation: true
};

// Tăng cường cảm ứng ảo toàn diện
let response = {
  boostLevel: "extreme",
  touchSamplingRate: 360,
  touchResponse: "ultra-fast",
  headshotRate: 1.9,
  touchDPIBoost: 720,
  stabilityMode: "pro",
  delayFix: true,
  vibrationReduce: true,
  aimlockAssist: true,
  edgeTrackingEnhance: true,
  multiFingerSync: true,
  latencyProfile,
  gyroAssist,
  uuid,
  model,
  os,
  systemPriorityPatch: {
    process: "com.dts.freefiremax",
    memoryBoost: "dynamic",
    backgroundLimit: "strict"
  }
};

$done({ body: JSON.stringify(response) });
