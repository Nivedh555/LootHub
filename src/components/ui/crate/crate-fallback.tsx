import { cn } from "@/lib/utils";

/**
 * Static poster shown while the R3F canvas loads.
 * With `fill` it stretches to its (already sized) parent so the swap to the
 * live canvas causes zero layout shift.
 */
export function CrateFallback({ size = 330, fill = false }: { size?: number; fill?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        fill && "absolute inset-0",
      )}
      style={fill ? undefined : { width: size, height: size }}
      aria-hidden
    >
      {/* Radial purple glow behind silhouette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 60%, rgba(124,58,237,0.30), transparent 55%)",
        }}
      />
      {/* Simple crate silhouette using inline SVG (deterministic) */}
      <svg
        width="55%"
        height="45%"
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
