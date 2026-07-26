"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Card surface with a cursor-tracking radial glow + glowing border sweep.
 * Blend of 21st.dev @preetsuthar17/spotlight-card (inner glow) and
 * @easemize/spotlight-card (border spotlight), adapted to our tokens.
 */
export function SpotlightCard({
  as: Tag = "div",
  children,
  className,
  spotlightColor = "rgba(124, 58, 237, 0.28)",
  borderColor = "rgba(167, 139, 250, 0.85)",
  ...props
}: React.ComponentProps<"div"> & {
  as?: "div" | "article";
  spotlightColor?: string;
  borderColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [lit, setLit] = useState(false);

  function track(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <Tag
      ref={ref}
      onMouseMove={track}
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card",
        "transition-shadow duration-300",
        lit && "shadow-[0_18px_50px_-24px_rgba(124,58,237,0.55)]",
        className,
      )}
      {...props}
    >
      {/* Border spotlight: a bright ring segment that follows the cursor. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity: lit ? 1 : 0,
          background: `radial-gradient(14rem circle at ${pos.x}px ${pos.y}px, ${borderColor}, transparent 55%)`,
          padding: 1,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      />
      {/* Inner glow following the cursor. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: lit ? 1 : 0,
          background: `radial-gradient(24rem circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 42%)`,
        }}
      />
      {children}
    </Tag>
  );
}
