"use client";

/**
 * Client boundary for the three.js hero. `ssr: false` keeps three.js out of
 * the server bundle and code-splits it to the home route only; the static
 * starfield shows while the chunk loads, on WebGL failure, and whenever the
 * visitor prefers reduced motion.
 */

import dynamic from "next/dynamic";
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
  loading: () => <Starfield />,
});

export function PixelHeroLoader({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <Starfield className={className} />;
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      <Starfield />
      <PixelRocketHero />
    </div>
  );
}
