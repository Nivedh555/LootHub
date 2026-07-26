"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

/**
 * Floating cart button: pinned under the navbar on desktop, docked
 * bottom-right on mobile. Badge pops/scales whenever the count changes.
 */
export function FloatingCart() {
  const { count } = useCart();
  const reduced = useReducedMotion();
  const prev = useRef(count);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (count !== prev.current) {
      prev.current = count;
      setPulse((p) => p + 1);
    }
  }, [count]);

  return (
    <motion.div
      className="fixed bottom-5 right-5 z-40 sm:bottom-auto sm:right-6 sm:top-[5.25rem]"
      initial={reduced ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href="/cart"
        aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-surface/90 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ boxShadow: "0 0 0 1px rgba(124,58,237,0.25), 0 8px 32px -8px rgba(124,58,237,0.65)" }}
      >
        <ShoppingBag className="h-6 w-6 text-foreground transition-colors group-hover:text-primary" aria-hidden />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={pulse}
              initial={reduced ? false : { scale: 0.4 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="absolute -right-1.5 -top-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground shadow-[0_0_12px_rgba(124,58,237,0.9)] ring-2 ring-background"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}
