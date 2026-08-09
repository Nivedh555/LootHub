"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { gsap, EASE_EXPO, DUR } from "@/lib/gsap";
import { useMouseParallax } from "@/hooks/use-parallax";
import type { Product } from "@/lib/types";
import { ProductCover } from "@/components/product-cover";
import { discord } from "@/config/site";

interface HeroProps {
  featuredProduct?: Product | null;
  totalItems: number;
}

export function Hero({ featuredProduct, totalItems }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  const { onMouseMove, onMouseLeave } = useMouseParallax(productRef, 10);

  // GSAP entrance animation
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE_EXPO } });

      // Stagger each headline word
      const words = headlineRef.current?.querySelectorAll("[data-word]") ?? [];

      tl.fromTo(
        words,
        { opacity: 0, y: 60, skewY: 3 },
        { opacity: 1, y: 0, skewY: 0, duration: DUR.cinematic, stagger: 0.12 },
      )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: DUR.slow },
          "-=0.8",
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: DUR.base },
          "-=0.7",
        )
        .fromTo(
          statsRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: DUR.base },
          "-=0.5",
        )
        .fromTo(
          productRef.current,
          { opacity: 0, scale: 0.92, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: DUR.cinematic, ease: "power3.out" },
          "-=1.2",
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative -mt-[4.5rem] min-h-[90vh] overflow-hidden pt-[4.5rem] flex items-center"
      aria-label="Hero"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-100" aria-hidden />
      <div className="glow-orbs absolute inset-0" aria-hidden />
      <div className="glow-noise absolute inset-0" aria-hidden />
      <div className="glow-vignette absolute inset-0" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px] lg:gap-8">

          {/* Left — text */}
          <div>
            {/* Eyebrow */}
            <p className="eyebrow mb-6 tracking-[0.25em] text-secondary/80">
              Digital Gaming Marketplace
            </p>

            {/* Headline */}
            <div
              ref={headlineRef}
              className="font-display text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.9] tracking-tight"
              aria-label="The Loot Market"
            >
              <div className="overflow-hidden">
                <span data-word className="block text-foreground">THE</span>
              </div>
              <div className="overflow-hidden">
                <span data-word className="block text-gradient">LOOT</span>
              </div>
              <div className="overflow-hidden">
                <span data-word className="block text-foreground">MARKET.</span>
              </div>
            </div>

            {/* Sub */}
            <p
              ref={subRef}
              className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Rare digital items. Fast delivery.{" "}
              <span className="text-foreground/80">Built for gamers.</span>
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/browse"
                className={cn(
                  buttonVariants({ variant: "primary", size: "lg" }),
                  "font-display text-xs tracking-widest uppercase px-6",
                )}
              >
                Explore Loot <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={discord.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "font-display text-xs tracking-widest uppercase px-6 border-white/10 text-foreground/70 hover:text-foreground",
                )}
              >
                <MessagesSquare className="h-4 w-4 text-[#7289da]" />
                Join Discord
              </a>
            </div>

            {/* Stats strip — ClearPath-style with trust badge */}
            <div
              ref={statsRef}
              className="mt-10 flex flex-wrap items-center gap-6"
            >
              <StatItem value={totalItems} label="Items listed" />
              <span className="h-8 w-px bg-border" aria-hidden />
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary/20 text-[10px] font-bold text-primary">✦</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-success/20 text-[10px] font-bold text-success">✓</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-accent/20 text-[10px] font-bold text-accent">♥</span>
                </div>
                <div>
                  <p className="font-display text-lg font-black text-foreground leading-none">Trusted</p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">by gamers</p>
                </div>
              </div>
              <span className="h-8 w-px bg-border" aria-hidden />
              <StatItem value="24/7" label="Discord support" isString />
            </div>
          </div>

          {/* Right — featured product */}
          <div className="hidden lg:flex items-center justify-center">
            {featuredProduct ? (
              <div
                ref={productRef}
                className="relative w-full max-w-[360px] cursor-default"
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Glow behind card */}
                <div
                  className="absolute inset-0 rounded-2xl bg-primary/20 blur-3xl scale-90"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
                  <div className="aspect-[4/3]">
                    <ProductCover product={featuredProduct} className="h-full w-full" />
                  </div>
                  <div className="p-4">
                    <p className="eyebrow mb-1">{featuredProduct.game}</p>
                    <p className="font-display text-sm font-bold leading-tight text-foreground line-clamp-2">
                      {featuredProduct.title}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-display text-xl font-black text-foreground">
                        ${featuredProduct.price.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" aria-hidden />
                        In stock
                      </span>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -right-3 -top-3 rounded-xl border border-primary/40 bg-primary/20 px-2.5 py-1 text-[11px] font-display font-bold text-primary backdrop-blur-sm">
                  FEATURED
                </div>
              </div>
            ) : (
              <HeroPlaceholder />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ value, label, isString }: { value: number | string; label: string; isString?: boolean }) {
  return (
    <div>
      <p className="font-display text-2xl font-black text-foreground">
        {isString ? value : Number(value).toLocaleString()}
      </p>
      <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function HeroPlaceholder() {
  return (
    <div className="relative flex h-64 w-full max-w-[360px] items-center justify-center">
      <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-3xl" />
      <div className="relative z-10 text-center">
        <p className="font-display text-4xl font-black text-gradient">LOOT</p>
        <p className="mt-2 text-sm text-muted-foreground">Premium items available</p>
      </div>
    </div>
  );
}
