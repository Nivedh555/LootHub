"use client";

import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Particles } from "@/components/ui/particles";
import { FloatingPaths } from "@/components/kokonutui/background-paths";
import { cn } from "@/lib/utils";

/**
 * Ambient page backdrop composed from registry components:
 *  - MagicUI AnimatedGridPattern (animated grid squares)
 *  - MagicUI Particles (subtle floating particles)
 *  - KokonutUI FloatingPaths (slow flowing light beams)
 * plus a CSS noise + gradient-orb layer for film grain.
 */
export function AmbientBackground({
  className,
  particles = true,
  paths = true,
}: {
  className?: string;
  particles?: boolean;
  paths?: boolean;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <AnimatedGridPattern
        numSquares={24}
        maxOpacity={0.08}
        duration={4}
        className="absolute inset-0 fill-primary/10 stroke-primary/15 [mask-image:radial-gradient(ellipse_90%_70%_at_50%_30%,#000_30%,transparent_100%)]"
      />
      <div className="ambient-orbs absolute inset-0" />
      {paths && <FloatingPaths position={1} />}
      {particles && (
        <Particles className="absolute inset-0" quantity={40} staticity={60} ease={70} color="#a78bfa" size={0.5} />
      )}
      <div className="ambient-noise absolute inset-0" />
    </div>
  );
}
