/**
 * Central GSAP setup file.
 * Import from here instead of directly from "gsap" so plugins are
 * registered exactly once and tree-shaking keeps unused plugins out.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/** Default ease used across the site for a premium, cinematic feel. */
export const EASE_EXPO = "power4.out";
export const EASE_BACK = "back.out(1.4)";
export const EASE_SOFT = "power2.out";

/** Durations (seconds) */
export const DUR = {
  fast: 0.35,
  base: 0.6,
  slow: 1.0,
  cinematic: 1.4,
} as const;

/** Shared ScrollTrigger defaults for section reveals */
export const ST_DEFAULTS = {
  start: "top 85%",
  end: "top 20%",
  toggleActions: "play none none none",
} as const;
