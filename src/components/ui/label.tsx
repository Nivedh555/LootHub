import { cn } from "@/lib/utils";
import type { LabelHTMLAttributes } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("font-display text-[10px] uppercase tracking-wide leading-none text-foreground peer-disabled:opacity-60", className)}
      {...props}
    />
  );
}