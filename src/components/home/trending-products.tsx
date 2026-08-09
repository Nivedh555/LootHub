"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface TrendingProductsProps {
  products: Product[];
}

export function TrendingProducts({ products }: TrendingProductsProps) {
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGsapReveal(headRef, { variant: "fade-up", start: "top 88%" });
  useGsapReveal(gridRef, { variant: "scale-in", stagger: 0.06, start: "top 85%" });

  const featured = products
    .filter((p) => p.stock > 0)
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
    .slice(0, 8);

  if (featured.length === 0) return null;

  return (
    <section
      id="shop"
      className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
      aria-labelledby="trending-heading"
    >
      {/* Section number backdrop — Fuel-style */}
      <span className="pointer-events-none absolute -left-8 -top-8 select-none font-display text-[11rem] font-black leading-none text-foreground/[0.03] sm:text-[14rem]" aria-hidden>
        01
      </span>

      <div className="relative">
        <div ref={headRef} className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Marketplace</p>
            <h2
              id="trending-heading"
              className="font-display text-3xl font-black leading-tight text-foreground sm:text-4xl"
            >
              Trending Loot
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* ClearPath-style trust badge */}
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm sm:flex">
              <span className="font-display text-sm font-bold text-success">✦</span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Trusted by <span className="text-foreground">{products.length}+</span> buyers
              </span>
            </div>
            <Link
              href="/browse"
              className="inline-flex shrink-0 items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-widest text-primary/80 transition-colors hover:text-primary"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-5"
        >
          {featured.map((product) => (
            <div key={product.id} data-reveal>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
