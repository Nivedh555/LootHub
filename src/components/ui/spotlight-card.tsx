"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Hard-edged arcade card. Kept the SpotlightCard name/props so existing
 * consumers work unchanged: `borderColor` becomes the hover border color,
 * `spotlightColor` is accepted but unused (soft glows don't fit pixel style).
 * On hover the card lifts off a hard drop shadow.
 */
export function SpotlightCard({
  as: Tag = "div",
  children,
  className,
  // Pulled out so it never reaches the DOM element.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  spotlightColor: _spotlightColor,
  borderColor,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  as?: "div" | "article";
  spotlightColor?: string;
  borderColor?: string;
}) {
  const [lit, setLit] = useState(false);

  return (
    <Tag
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
      className={cn(
        "group relative overflow-hidden rounded-none border-2 border-border bg-card",
        "transition-[border-color,box-shadow,transform] duration-100",
        lit && "-translate-x-[2px] -translate-y-[2px] pixel-shadow-dark",
        lit && !borderColor && "border-primary",
        className,
      )}
      style={{
        ...(lit && borderColor ? { borderColor } : undefined),
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
