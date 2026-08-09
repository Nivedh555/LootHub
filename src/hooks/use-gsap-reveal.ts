"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, EASE_EXPO, DUR, ST_DEFAULTS } from "@/lib/gsap";

export type RevealVariant = "fade-up" | "fade-in" | "clip-up" | "scale-in";

interface UseGsapRevealOptions {
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  stagger?: number;
  /** If true, use ScrollTrigger. If false, animate immediately on mount. */
  scrollTrigger?: boolean;
  start?: string;
}

/**
 * Attach a GSAP entrance animation to a container ref.
 * Targets direct [data-reveal] children, or the container itself if none exist.
 *
 * Usage:
 *   const ref = useRef(null);
 *   useGsapReveal(ref, { variant: "fade-up", stagger: 0.08 });
 *   <div ref={ref}><div data-reveal>...</div></div>
 */
export function useGsapReveal<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  opts: UseGsapRevealOptions = {},
) {
  const {
    variant = "fade-up",
    delay = 0,
    duration = DUR.base,
    stagger = 0,
    scrollTrigger = true,
    start = ST_DEFAULTS.start,
  } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = el.querySelectorAll("[data-reveal]");
    const animTarget = targets.length > 0 ? Array.from(targets) : [el];

    const fromVars: gsap.TweenVars = getFromVars(variant);
    const toVars: gsap.TweenVars = {
      ...getToVars(variant),
      duration,
      ease: EASE_EXPO,
      delay,
      stagger: stagger > 0 ? { each: stagger, from: "start" } : undefined,
    };

    const ctx = gsap.context(() => {
      if (scrollTrigger) {
        gsap.fromTo(animTarget, fromVars, {
          ...toVars,
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: ST_DEFAULTS.toggleActions,
            once: true,
          },
        });
      } else {
        gsap.fromTo(animTarget, fromVars, toVars);
      }
    }, el);

    return () => {
      ctx.revert();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function getFromVars(variant: RevealVariant): gsap.TweenVars {
  switch (variant) {
    case "fade-up":
      return { opacity: 0, y: 40, scale: 0.98 };
    case "fade-in":
      return { opacity: 0 };
    case "clip-up":
      return { opacity: 0, y: 30, clipPath: "inset(100% 0% 0% 0%)" };
    case "scale-in":
      return { opacity: 0, scale: 0.88 };
  }
}

function getToVars(variant: RevealVariant): gsap.TweenVars {
  switch (variant) {
    case "fade-up":
      return { opacity: 1, y: 0, scale: 1 };
    case "fade-in":
      return { opacity: 1 };
    case "clip-up":
      return { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" };
    case "scale-in":
      return { opacity: 1, scale: 1 };
  }
}
