import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "outline" | "muted";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary border-primary/60",
  accent: "bg-accent/15 text-accent border-accent/60",
  outline: "border-border text-muted-foreground",
  muted: "bg-muted text-muted-foreground border-border",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-none border-2 px-2 py-1 font-display text-[9px] uppercase tracking-wide leading-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
