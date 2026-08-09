"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Card surface with a cursor-tracking radial glow + glowing border sweep.
 * Rewritten to use CSS custom properties for cursor position — zero setState
 * calls on mousemove, so hovering never re-renders the card subtree.
 */
export function SpotlightCard({
  as: Tag = "div",
  children,
  className,
  spotlightColor = "rgba(16, 185, 129, 0.25)",
  borderColor = "rgba(167, 139, 250, 0.85)",
  ...props
}: React.ComponentProps<"div"> & {
  as?: "div" | "article";
  spotlightColor?: string;
  borderColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function track(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current?.style.setProperty("--x", `${x}px`);
    ref.current?.style.setProperty("--y", `${y}px`);
  }

  return (
    <Tag
      ref={ref}
      onMouseMove={track}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card",
        "transition-all duration-[160ms] ease-out",
        "hover:-translate-y-0.5 hover:border-primary/50 hover:bg-surface-2",
        className,
      )}
      {...props}
    >
      {/* Border spotlight: a bright ring segment that follows the cursor. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(14rem circle at var(--x, 50%) var(--y, 50%), ${borderColor}, transparent 55%)`,
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
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(24rem circle at var(--x, 50%) var(--y, 50%), ${spotlightColor}, transparent 42%)`,
        }}
      />
      {children}
    </Tag>
  );
}
