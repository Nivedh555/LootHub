/**
 * Pure, deterministic timeline evaluator for the loot-crate animation.
 * t is normalized 0 -> 1 over the ~12s loop.
 *
 * Sequence: idle float → camera moves → lock glows → unlock → lid opens
 * (overshoot) → light + particles → gem emerges → camera zoom → gem spins →
 * gem vanishes (burst) → lid closes → settle → seamless loop.
 *
 * Every track returns to its t=0 value by t=1 so the loop never snaps.
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
  /** Burst particle expansion 0..1 — positions derive directly from this */
  burstExpand: number;
}

const LID_OPEN_DEG = 115;

export function evalTimeline(t: number): CrateFrame {
  t = ((t % 1) + 1) % 1;

  const bodyY = Math.sin(t * Math.PI * 2) * 0.02;
  const bodyYaw = Math.sin(t * Math.PI * 2 * 0.7) * 0.04;

  // End-of-loop envelopes: lid close 0.86-0.94, camera settle 0.94-1.0
  const close = track(t, 0.86, 0.94, easeInOutCubic);
  const settle = track(t, 0.94, 1.0, easeInOutCubic);

  // Camera: dolly toward front-quarter 0.10-0.22; return to rest during settle
  const cameraBlend = easeOutCubic(track(t, 0.1, 0.22)) * (1 - settle);

  // Lock glow 0.18-0.28 with pulse, fades out with the light at the end
  const lockBase = track(t, 0.18, 0.28, easeInOutCubic);
  const lockPulse = Math.sin(lockBase * Math.PI) * 0.6 + 0.4;
  const lockEmissive = lockBase * 2 * lockPulse * (1 - track(t, 0.8, 0.9));

  // Shiver (anticipation) builds 0.22-0.28, cuts at unlock
  const shiver = track(t, 0.22, 0.28, easeInQuad) * (1 - track(t, 0.28, 0.32, easeOutCubic)) * 0.02;

  // Unlock 0.28-0.32; shackle re-latches while the lid closes so the loop is seamless
  const unlock = track(t, 0.28, 0.32, easeOutCubic);
  const shackleOpen = unlock * (1 - close);
  const lockOpacity = 1 - unlock * 0.8 * (1 - close);

  // Lid open 0.32-0.42: easeOutBack overshoots past -115° (≈ -126°) then settles.
  // Close is slower + eased both ways — weight. Multiplying by (1-close) returns to 0.
  const lidOpen = track(t, 0.32, 0.42, easeOutBack);
  const lidRotation = (-Math.PI / 180) * LID_OPEN_DEG * lidOpen * (1 - close);

  // Light + particles: ramp 0.38-0.48, hold, fade 0.80-0.92
  const lightOn = track(t, 0.38, 0.48, easeOutCubic) * (1 - track(t, 0.8, 0.92));
  const coneScale = lightOn;
  const lightIntensity = lightOn * 3;
  const sparkleIntensity = lightOn;

  // Gem emerge 0.44-0.58 with overshoot
  const gemUp = track(t, 0.44, 0.58, easeOutBack);
  const gemRise = gemUp;

  // Camera zoom 0.52-0.66, pulls back out as the gem vanishes
  const cameraZoom = track(t, 0.52, 0.66, easeInOutCubic) * (1 - track(t, 0.8, 0.94));

  // Gem spin ramps 0.55-0.80
  const gemSpin = track(t, 0.55, 0.8, easeOutCubic);

  // Gem vanish 0.80-0.86: shrink + fade (scale collapses with it)
  const gemVanish = track(t, 0.8, 0.86, easeInQuad);
  const gemOpacity = 1 - gemVanish;
  const gemScale = gemUp * (1 - gemVanish);

  // Burst particles: one-shot at the vanish. Expansion is the direct position
  // multiplier (pure function of t — no accumulation), opacity is a bell curve.
  const burstExpand = track(t, 0.8, 0.9, easeOutCubic);
  const burstOpacity =
    track(t, 0.8, 0.82, easeOutCubic) * (1 - track(t, 0.84, 0.9, easeInQuad));

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
