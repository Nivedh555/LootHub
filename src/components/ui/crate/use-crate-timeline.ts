/**
 * Pure, deterministic timeline evaluator for the loot-crate animation.
 * t is normalized 0 -> 1 over the ~12s loop.
 */

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInQuad(t: number) {
  return t * t;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Evaluate a track over a normalized sub-range [start, end] within the global t. */
function track(t: number, start: number, end: number, ease = easeInOutCubic) {
  if (t < start) return 0;
  if (t > end) return 1;
  return ease(clamp01((t - start) / (end - start)));
}

export interface CrateFrame {
  /** Body idle float Y offset */
  bodyY: number;
  /** Body idle yaw drift */
  bodyYaw: number;
  /** Camera dolly blend 0=rest, 1=near-front */
  cameraBlend: number;
  /** Lock emissive intensity */
  lockEmissive: number;
  /** Crate shiver intensity (small squash-stretch / wobble) */
  shiver: number;
  /** Lock shackle rotation 0=closed, 1=open */
  shackleOpen: number;
  /** Lock opacity 1=visible, 0=faded */
  lockOpacity: number;
  /** Lid hinge rotation in radians (0 = closed, negative = open) */
  lidRotation: number;
  /** Volumetric cone scale */
  coneScale: number;
  /** Interior point light intensity */
  lightIntensity: number;
  /** Gem rise 0=inside, 1=emerged */
  gemRise: number;
  /** Gem scale */
  gemScale: number;
  /** Gem Y rotation speed factor */
  gemSpin: number;
  /** Gem opacity/vanish 1=visible, 0=gone */
  gemOpacity: number;
  /** Camera zoom toward gem 0=none, 1=zoomed */
  cameraZoom: number;
  /** Ambient sparkle intensity */
  sparkleIntensity: number;
  /** Burst particle opacity */
  burstOpacity: number;
  /** Burst particle expansion */
  burstExpand: number;
}

export function evalTimeline(t: number): CrateFrame {
  const bodyY = Math.sin(t * Math.PI * 2) * 0.02;
  const bodyYaw = Math.sin(t * Math.PI * 2 * 0.7) * 0.04;

  // Camera: dolly from rest toward front-quarter during 0.10-0.22
  const cameraBlend = easeOutCubic(track(t, 0.1, 0.22));

  // Lock glow 0.18-0.28 with pulse
  const lockBase = track(t, 0.18, 0.28, easeInOutCubic);
  const lockPulse = Math.sin(lockBase * Math.PI) * 0.6 + 0.4;
  const lockEmissive = lockBase * 2 * lockPulse;

  // Shiver (anticipation) 0.22-0.32
  const shiver = track(t, 0.22, 0.32, easeInQuad) * 0.02;

  // Unlock 0.28-0.32
  const unlock = track(t, 0.28, 0.32, easeOutCubic);
  const shackleOpen = unlock;
  const lockOpacity = 1 - unlock * 0.8; // fades slightly but not fully gone immediately

  // Lid open 0.32-0.42 with overshoot to -122deg then settle at -115deg
  const lidOpen = track(t, 0.32, 0.42, easeOutBack);
  const lidRotation = -Math.PI / 180 * lerp(0, 122, lidOpen) + Math.sin(lidOpen * Math.PI) * 0.05; // slight overshoot wobble

  // Light + particles 0.38-0.75
  const lightOn = track(t, 0.38, 0.75, easeOutCubic);
  const coneScale = lightOn;
  const lightIntensity = lightOn * 3;
  const sparkleIntensity = lightOn;

  // Gem emerge 0.44-0.58 with overshoot
  const gemUp = track(t, 0.44, 0.58, easeOutBack);
  const gemRise = gemUp;
  const gemScale = gemUp;

  // Camera zoom 0.52-0.66
  const cameraZoom = track(t, 0.52, 0.66, easeInOutCubic);

  // Gem spin 0.55-0.80
  const gemSpin = track(t, 0.55, 0.8, easeOutCubic);

  // Gem vanish 0.80-0.86
  const gemVanish = track(t, 0.8, 0.86, easeInQuad);
  const gemOpacity = 1 - gemVanish;

  // Burst particles 0.80-0.86
  const burst = track(t, 0.8, 0.86, easeOutCubic);
  const burstOpacity = burst;
  const burstExpand = burst;

  return {
    bodyY,
    bodyYaw,
    cameraBlend,
    lockEmissive,
    shiver,
    shackleOpen,
    lockOpacity,
    lidRotation,
    coneScale,
    lightIntensity,
    gemRise,
    gemScale,
    gemSpin,
    gemOpacity,
    cameraZoom,
    sparkleIntensity,
    burstOpacity,
    burstExpand,
  };
}
