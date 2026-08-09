"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Applies a vertical parallax offset to an element as it scrolls.
 * speed > 0 = moves up slower than scroll (floats up)
 * speed < 0 = moves down faster than scroll
 */
export function useParallax<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  speed = 0.2,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Skip heavy parallax on small screens for performance
    if (window.innerWidth < 768) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed * -100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);
}

/**
 * Mouse-tracking tilt/translate for a 3-D parallax card feel.
 * Returns event handlers to spread onto the target element.
 */
export function useMouseParallax<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  strength = 12,
) {
  const rafId = useRef<number | null>(null);

  function onMouseMove(e: React.MouseEvent<T>) {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      gsap.to(el, {
        rotateY: dx * strength * 0.5,
        rotateX: -dy * strength * 0.5,
        x: dx * strength,
        y: dy * strength * 0.6,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 800,
      });
    });
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    gsap.to(el, {
      rotateY: 0,
      rotateX: 0,
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
    });
  }

  return { onMouseMove, onMouseLeave };
}
