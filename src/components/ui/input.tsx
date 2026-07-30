import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-none border-2 border-border bg-input px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-[border-color,box-shadow] focus:border-secondary focus:outline-none focus:shadow-[3px_3px_0_0_#00ffff] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";