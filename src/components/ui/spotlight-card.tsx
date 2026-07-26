"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Card surface with a cursor-tracking radial glow.
 * Adapted from 21st.dev @preetsuthar17/spotlight-card for our tokens.
 */
export function SpotlightCard({
  as: Tag = "div",
  children,
  className,
  spotlightColor = "rgba(124, 58, 237, 0.28)",
  ...props
}: React.ComponentProps<"div"> & {
  as?: "div" | "article";
  spotlightColor?: string;
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
        "relative overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
      {...props}
    >
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
