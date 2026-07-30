import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full appearance-none rounded-none border-2 border-border bg-input px-3.5 text-sm text-foreground transition-[border-color,box-shadow] focus:border-secondary focus:outline-none focus:shadow-[3px_3px_0_0_#00ffff] disabled:opacity-50",
        className,
      )}
      style={{ colorScheme: "dark" }}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";