import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "outline" | "muted";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-primary border border-primary/30",
  accent: "bg-accent/15 text-accent border border-accent/30",
  outline: "border border-border text-muted-foreground",
  muted: "bg-muted text-muted-foreground border border-border",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}