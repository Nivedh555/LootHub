"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Flame, Sparkles, Trophy } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Reveal } from "@/components/ui/reveal";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type Tab = "popular" | "new" | "best";

const TABS: { key: Tab; label: string; icon: typeof Flame }[] = [
  { key: "popular", label: "Popular", icon: Flame },
  { key: "new", label: "New", icon: Sparkles },
  { key: "best", label: "Best Seller", icon: Trophy },
];

export function FeaturedCarousel({ products }: { products: Product[] }) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>("popular");

  const lists: Record<Tab, Product[]> = {
    popular: [...products]
      .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || b.stock - a.stock)
      .slice(0, 8),
    new: [...products].slice(-8).reverse(),
    best: [...products].sort((a, b) => b.price - a.price).slice(0, 8),
  };
  const list = lists[tab];

  if (products.length === 0) return null;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-200",
                tab === t.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={tab === t.key}
            >
              {tab === t.key && (
                <motion.span
                  layoutId="featured-tab"
                  className="absolute inset-0 rounded-lg bg-primary shadow-[0_0_18px_-4px_rgba(16,185,129,0.7)]"
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <t.icon className="relative z-10 h-4 w-4" aria-hidden />
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Carousel opts={{ align: "start", dragFree: true }} className="px-0">
        <CarouselContent className="-ml-4">
          {list.map((p, i) => (
            <CarouselItem key={`${tab}-${p.id}`} className="basis-[240px] pl-4 sm:basis-[260px]">
              <Reveal delay={reduced ? 0 : i * 0.05} inView variant="scale">
                <ProductCard product={p} />
              </Reveal>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-top-[3.25rem] left-auto right-12 hidden size-10 rounded-xl border-white/10 bg-white/5 backdrop-blur-md hover:border-primary/50 hover:bg-white/10 sm:inline-flex" />
        <CarouselNext className="-top-[3.25rem] right-0 hidden size-10 rounded-xl border-white/10 bg-white/5 backdrop-blur-md hover:border-primary/50 hover:bg-white/10 sm:inline-flex" />
      </Carousel>
    </div>
  );
}
