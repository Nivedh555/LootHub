"use client";

import { useRef } from "react";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { Search, Wallet, ShieldCheck, Package } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "SELECT",
    body: "Browse rare items across Adopt Me!, MM2, Grow a Garden, and more. Real-time stock.",
  },
  {
    num: "02",
    icon: Wallet,
    title: "CHECKOUT",
    body: "Pay securely with USDT (BEP20) or Litecoin. Scan the QR and send the exact amount.",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "VERIFY",
    body: "Open a Discord ticket with your order ID. The owner verifies your payment on-chain.",
  },
  {
    num: "04",
    icon: Package,
    title: "RECEIVE",
    body: "Your item is traded directly into your in-game inventory. Fast, tracked, reliable.",
  },
];

export function HowItWorks() {
  const headRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useGsapReveal(headRef, { variant: "fade-up", start: "top 88%" });
  useGsapReveal(stepsRef, { variant: "fade-up", stagger: 0.12, start: "top 82%" });

  return (
    <section
      id="how"
      className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
      aria-labelledby="how-heading"
    >
      {/* Section number backdrop */}
      <span className="pointer-events-none absolute -left-6 top-0 select-none font-display text-[10rem] font-black leading-none text-foreground/[0.02] sm:text-[13rem]" aria-hidden>
        03
      </span>

      <div className="relative">
      <div ref={headRef} className="mb-12 text-center">
        <p className="eyebrow mb-3">Process</p>
        <h2
          id="how-heading"
          className="font-display text-3xl font-black text-foreground sm:text-4xl"
        >
          From Cart to In-Game<br />in Four Steps.
        </h2>
      </div>

      <div
        ref={stepsRef}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {steps.map((step, i) => (
          <div
            key={step.num}
            data-reveal
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1"
          >
            {/* Connector line on desktop */}
            {i < steps.length - 1 && (
              <div
                className="absolute -right-px top-10 hidden h-px w-6 bg-border lg:block"
                aria-hidden
              />
            )}
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-display text-3xl font-black text-primary/15 transition-colors group-hover:text-primary/25">
                {step.num}
              </span>
            </div>
            <h3 className="mt-5 font-display text-sm font-black tracking-widest text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
