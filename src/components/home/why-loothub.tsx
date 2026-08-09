"use client";

import { useRef } from "react";
import { Zap, ShieldCheck, Package, MessagesSquare } from "lucide-react";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";

const reasons = [
  {
    icon: Zap,
    title: "Fast Delivery",
    body: "After your crypto payment confirms, open a Discord ticket. Your item is traded into your inventory — usually within minutes.",
  },
  {
    icon: Package,
    title: "Real Stock",
    body: "Every item you see is actually available. Stock is live — when it's gone, it's gone. No misleading listings.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    body: "No card fees, no chargebacks. Pay privately with USDT (BEP20) or Litecoin. We never ask for your game credentials.",
  },
  {
    icon: MessagesSquare,
    title: "Discord Support",
    body: "Every order is fulfilled through a Discord ticket — trackable, direct, and handled by the store owner personally.",
  },
];

export function WhyLootHub() {
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGsapReveal(headRef, { variant: "fade-up", start: "top 88%" });
  useGsapReveal(gridRef, { variant: "fade-up", stagger: 0.1, start: "top 82%" });

  return (
    <section
      id="trust"
      className="relative overflow-hidden border-y border-border/40 bg-surface/30 py-16 sm:py-20"
      aria-labelledby="why-heading"
    >
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      {/* Section number backdrop */}
      <span className="pointer-events-none absolute -left-4 -top-4 select-none font-display text-[10rem] font-black leading-none text-foreground/[0.02] sm:text-[13rem]" aria-hidden>
        04
      </span>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div ref={headRef} className="mb-12 text-center">
          <p className="eyebrow mb-3">Why LootHub</p>
          <h2
            id="why-heading"
            className="font-display text-3xl font-black text-foreground sm:text-4xl"
          >
            Built Different.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            A single trusted seller. No marketplace middlemen. No bots.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {reasons.map((r) => (
            <div
              key={r.title}
              data-reveal
              className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <r.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-sm font-bold tracking-wider text-foreground">
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
