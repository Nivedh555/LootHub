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
        className="group relative flex h-14 w-14 items-center justify-center rounded-none border-2 border-primary bg-surface pixel-shadow-dark transition-colors duration-100 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-none border-2 border-background bg-accent px-1 font-display text-[9px] text-accent-foreground"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}
