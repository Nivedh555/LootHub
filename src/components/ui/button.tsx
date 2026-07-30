import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "primary" | "accent" | "secondary" | "glass" | "outline" | "ghost" | "success" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground pixel-shadow-dark hover:bg-[#ff33ff]",
  // accent is an alias of primary — magenta is the action color
  accent:
    "border-primary bg-primary text-primary-foreground pixel-shadow-dark hover:bg-[#ff33ff]",
  secondary:
    "border-secondary bg-transparent text-secondary pixel-shadow-cyan hover:bg-secondary/10",
  glass:
    "border-secondary bg-transparent text-secondary pixel-shadow-cyan hover:bg-secondary/10",
  outline:
    "border-border bg-surface text-foreground pixel-shadow-dark hover:border-primary",
  // Transparent border keeps layout identical to bordered variants
  ghost: "border-transparent text-foreground shadow-none hover:bg-surface-2 active:translate-x-0 active:translate-y-0",
  success:
    "border-success bg-success text-success-foreground pixel-shadow-dark hover:bg-[#33ffa0]",
  destructive:
    "border-destructive bg-destructive text-destructive-foreground pixel-shadow-dark hover:bg-[#ff5577]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-3 text-[10px] gap-1.5",
  md: "h-12 px-5 text-[11px] gap-2",
  lg: "h-13 px-7 text-xs gap-2.5",
  icon: "h-12 w-12",
};

export function buttonVariants(opts: { variant?: Variant; size?: Size } = {}) {
  const { variant = "primary", size = "md" } = opts;
  return cn(
    // Hard-edged arcade button: presses down into its own shadow on click.
    "inline-flex select-none items-center justify-center rounded-none border-2 font-display uppercase tracking-wide cursor-pointer transition-[transform,box-shadow,background-color,border-color] duration-100 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
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
