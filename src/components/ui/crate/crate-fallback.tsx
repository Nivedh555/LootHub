import { cn } from "@/lib/utils";

/**
 * Static poster shown while the R3F canvas loads.
 * Same dimensions as the canvas container to prevent layout shift.
 */
export function CrateFallback({ size = 330 }: { size?: number }) {
  return (
    <div
      className={cn("relative flex items-center justify-center rounded-2xl bg-surface", "border border-primary/20")}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Radial purple glow behind silhouette */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 60%, rgba(124,58,237,0.35), transparent 55%)",
        }}
      />
      {/* Simple crate silhouette using inline SVG (deterministic) */}
      <svg
        width={size * 0.55}
        height={size * 0.45}
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 opacity-60"
      >
        <rect x="10" y="40" width="100" height="50" rx="4" fill="#2e2245" />
        <rect x="8" y="38" width="104" height="8" rx="2" fill="#3e2f5e" />
        <rect x="55" y="48" width="10" height="14" rx="2" fill="#7c3aed" />
        <circle cx="60" cy="55" r="3" fill="#a78bfa" />
      </svg>
    </div>
  );
}
