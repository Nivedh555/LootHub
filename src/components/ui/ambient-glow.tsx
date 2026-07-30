import { cn } from "@/lib/utils";

/**
 * Zero-JS ambient background. Pure CSS layers:
 * 1. drifting radial-gradient orbs
 * 2. rotating light rays
 * 3. static noise texture
 * 4. vignette to focus center content
 *
 * Server-renderable; no client JS, no hydration risk.
 * Reduced motion is handled globally in globals.css.
 */
export function AmbientGlow({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="glow-orbs" />
      <div className="glow-rays" />
      <div className="glow-noise" />
      <div className="glow-vignette" />
    </div>
  );
}
