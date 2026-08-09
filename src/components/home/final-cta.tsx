"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { discord } from "@/config/site";

export function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  useGsapReveal(ref, { variant: "fade-up", stagger: 0.1, start: "top 85%" });

  return (
    <section
      className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
      aria-labelledby="final-cta-heading"
    >
      {/* Section number backdrop */}
      <span className="pointer-events-none absolute -left-4 bottom-0 select-none font-display text-[10rem] font-black leading-none text-foreground/[0.02] sm:text-[14rem]" aria-hidden>
        ✦
      </span>

      <div className="relative">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-14 text-center sm:px-12 sm:py-20"
      >
        {/* Ambient */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />

        <div className="relative">
          <p data-reveal className="eyebrow mb-5">
            Ready?
          </p>
          <h2
            data-reveal
            id="final-cta-heading"
            className="font-display text-4xl font-black leading-[0.9] text-foreground sm:text-6xl lg:text-7xl"
          >
            READY TO GET<br />
            <span className="text-gradient">YOUR LOOT?</span>
          </h2>
          <p data-reveal className="mx-auto mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
            Explore the marketplace. Rare items, real stock, crypto checkout.
            Delivered directly to your in-game inventory.
          </p>
          <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/browse"
              className={cn(
                buttonVariants({ variant: "primary", size: "lg" }),
                "font-display text-xs uppercase tracking-widest px-8",
              )}
            >
              Explore Marketplace <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={discord.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "font-display text-xs uppercase tracking-widest px-8 border-white/10 text-foreground/70",
              )}
            >
              <MessagesSquare className="h-4 w-4 text-[#7289da]" />
              Join Discord
            </a>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
