"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-none border-2 bg-card transition-colors",
              isOpen ? "border-primary" : "border-border",
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 p-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-[11px] leading-relaxed">{item.q}</span>
              <span
                className={cn(
                  "shrink-0 font-display text-sm",
                  isOpen ? "text-primary" : "text-secondary",
                )}
                aria-hidden
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="border-t-2 border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}