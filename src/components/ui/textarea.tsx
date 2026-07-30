import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full resize-y rounded-none border-2 border-border bg-input px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-[border-color,box-shadow] focus:border-secondary focus:outline-none focus:shadow-[3px_3px_0_0_#00ffff] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";