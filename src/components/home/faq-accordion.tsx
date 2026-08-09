"use client";

import { useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useGsapReveal(headRef, { variant: "fade-up", start: "top 88%" });
  useGsapReveal(listRef, { variant: "fade-up", stagger: 0.07, start: "top 85%" });

  return (
    <section
      id="faq"
      className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
      aria-labelledby="faq-heading"
    >
      {/* Section number backdrop */}
      <span className="pointer-events-none absolute -right-4 -top-6 select-none font-display text-[10rem] font-black leading-none text-foreground/[0.02] sm:text-[13rem]" aria-hidden>
        05
      </span>

      <div className="relative">
      <div ref={headRef} className="mb-10 text-center">
        <p className="eyebrow mb-3">Support</p>
        <h2
          id="faq-heading"
          className="font-display text-3xl font-black text-foreground sm:text-4xl"
        >
          Common Questions.
        </h2>
      </div>

      <div ref={listRef} className="mx-auto max-w-3xl divide-y divide-border/60">
        {items.map((item, i) => (
          <div key={i} data-reveal className="py-1">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={open === i}
            >
              <span className="font-display text-sm font-semibold tracking-wide text-foreground sm:text-base">
                {item.q}
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                {open === i
                  ? <Minus className="h-3.5 w-3.5" aria-hidden />
                  : <Plus className="h-3.5 w-3.5" aria-hidden />}
              </span>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                open === i ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0",
              )}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}