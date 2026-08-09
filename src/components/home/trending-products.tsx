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
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
      aria-labelledby="trending-heading"
    >
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
        <Link
          href="/browse"
          className="inline-flex shrink-0 items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-widest text-primary/80 transition-colors hover:text-primary"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
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
    </section>
  );
}
