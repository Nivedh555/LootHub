"use client";

/**
 * Client boundary for the three.js hero. `ssr: false` keeps three.js out of
 * the server bundle and code-splits it to the home route only; the static
 * starfield shows while the chunk loads, on WebGL failure, and whenever the
 * visitor prefers reduced motion.
 */

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

function Starfield({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 bg-background pixel-stars", className)}
    />
  );
}

const PixelRocketHero = dynamic(() => import("./pixel-rocket-hero"), {
  ssr: false,
  loading: () => null,
});

// Hydration-safe "has mounted" flag: false on the server and during the
// first client render, true right after — so both sides render the same tree.
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function PixelHeroLoader({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const mounted = useMounted();
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      <Starfield />
      {/* Only decide about the canvas after hydration; useReducedMotion is
          null on the server, which would otherwise mismatch this branch. */}
      {mounted && !reduced && <PixelRocketHero />}
    </div>
  );
}
