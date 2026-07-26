import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_1px_rgba(124,58,237,0.55)] hover:shadow-[0_0_28px_-4px_rgba(124,58,237,0.7)]",
  accent:
    "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_0_1px_rgba(22,163,74,0.5)] hover:shadow-[0_0_28px_-4px_rgba(22,163,74,0.6)]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/85",
  outline: "border border-border bg-surface text-foreground hover:bg-surface-2",
  ghost: "text-foreground hover:bg-surface-2",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2.5",
  icon: "h-11 w-11",
};

export function buttonVariants(opts: { variant?: Variant; size?: Size } = {}) {
  const { variant = "primary", size = "md" } = opts;
  return cn(
    "inline-flex select-none items-center justify-center rounded-xl font-semibold cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
    variantClasses[variant],
    sizeClasses[size],
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { variant?: Variant; size?: Size }
>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";