"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "info" | "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastApi {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const MAX_TOASTS = 4;
const DURATION: Record<ToastVariant, number> = {
  info: 5000,
  success: 5000,
  error: 7000, // errors linger a little longer
};

const variantStyles: Record<ToastVariant, string> = {
  info: "border-secondary",
  success: "border-success",
  error: "border-destructive",
};

const variantIcon: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  error: AlertTriangle,
};

const variantIconColor: Record<ToastVariant, string> = {
  info: "text-secondary",
  success: "text-success",
  error: "text-destructive",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), { id, message, variant }]);
      window.setTimeout(() => dismiss(id), DURATION[variant]);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (message) => toast(message, "success"),
      error: (message) => toast(message, "error"),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[];
  dismiss: (id: number) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = variantIcon[t.variant];
          return (
            <motion.div
              key={t.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              role={t.variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-2.5 rounded-none border-2 bg-surface p-3 pixel-shadow-dark",
                variantStyles[t.variant],
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", variantIconColor[t.variant])} aria-hidden />
              <p className="flex-1 font-display text-[10px] leading-relaxed text-foreground">
                {t.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
