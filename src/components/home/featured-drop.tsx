"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { useMouseParallax } from "@/hooks/use-parallax";
import { ProductCover } from "@/components/product-cover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function FeaturedDrop({ product }: { product: Product }) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGsapReveal(textRef, { variant: "fade-up", stagger: 0.1, start: "top 82%" });
  const { onMouseMove, onMouseLeave } = useMouseParallax(cardRef, 8);

  return (
    <section
      ref={sectionRef}
      id="featured"
      className="relative overflow-hidden border-y border-border/40 bg-surface/40 py-16 sm:py-20"
      aria-labelledby="featured-drop-heading"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <div ref={textRef}>
            <p data-reveal className="eyebrow mb-4">
              Featured Drop
            </p>
            <h2
              data-reveal
              id="featured-drop-heading"
              className="font-display text-3xl font-black leading-tight text-foreground sm:text-5xl"
            >
              {product.title}
            </h2>
            <p data-reveal className="mt-2 eyebrow text-muted-foreground/60 normal-case tracking-normal font-sans text-sm">
              {product.game}
              {product.rarity && <> · <span className="text-secondary">{product.rarity}</span></>}
            </p>
            <p data-reveal className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            <div data-reveal className="mt-6 flex items-center gap-4">
              <span className="font-display text-4xl font-black text-foreground">
                ${product.price.toFixed(2)}
              </span>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" aria-hidden />
                  {product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                  Sold out
                </span>
              )}
            </div>
            <div data-reveal className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/product/${product.id}`}
                className={cn(
                  buttonVariants({ variant: "primary", size: "lg" }),
                  "font-display text-xs uppercase tracking-widest px-6",
                )}
              >
                View Item <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Product visual */}
          <div className="flex items-center justify-center">
            <div
              ref={cardRef}
              className="relative w-full max-w-[420px] cursor-default"
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute inset-0 rounded-3xl bg-primary/15 blur-3xl scale-90 opacity-70"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <div className="aspect-[4/3]">
                  <ProductCover product={product} className="h-full w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
