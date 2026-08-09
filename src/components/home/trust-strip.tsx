"use client";

import { useRef } from "react";
import { Zap, ShieldCheck, Package, MessagesSquare } from "lucide-react";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";

const items = [
  { icon: Zap, label: "Fast Delivery" },
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: Package, label: "Real Stock" },
  { icon: MessagesSquare, label: "Discord Support" },
];

export function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null);
  useGsapReveal(ref, { variant: "fade-up", stagger: 0.1, start: "top 95%" });

  return (
    <div className="section-divider" aria-hidden>
      <div
        ref={ref}
        className="mx-auto flex max-w-7xl items-center justify-center overflow-x-auto px-4 py-5 sm:px-6"
      >
        {items.map((item, i) => (
          <div key={item.label} className="flex items-center">
            <div
              data-reveal
              className="flex items-center gap-2.5 whitespace-nowrap px-6 py-2 text-muted-foreground/70"
            >
              <item.icon className="h-4 w-4 text-primary/70 shrink-0" aria-hidden />
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.18em]">
                {item.label}
              </span>
            </div>
            {i < items.length - 1 && (
              <span className="h-4 w-px bg-border/60" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
