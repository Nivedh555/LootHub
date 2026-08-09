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
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import type { GameAccount } from "@/lib/types";

type Tab = "popular" | "new" | "best";

const TABS: { key: Tab; label: string; icon: typeof Flame }[] = [
  { key: "popular", label: "Popular", icon: Flame },
  { key: "new", label: "New", icon: Sparkles },
  { key: "best", label: "Best Seller", icon: Trophy },
];

export function FeaturedAccountsCarousel({ accounts }: { accounts: GameAccount[] }) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>("popular");

  const lists: Record<Tab, GameAccount[]> = {
    popular: [...accounts]
      .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || b.stock - a.stock)
      .slice(0, 8),
    new: [...accounts].slice(-8).reverse(),
    best: [...accounts].sort((a, b) => b.price - a.price).slice(0, 8),
  };
  const list = lists[tab];

  if (accounts.length === 0) return null;

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
                  layoutId="featured-account-tab"
                  className="absolute inset-0 rounded-lg bg-primary shadow-[0_0_18px_-4px_rgba(124,58,237,0.8)]"
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
          {list.map((a, i) => (
            <CarouselItem key={`${tab}-${a.id}`} className="basis-[240px] pl-4 sm:basis-[260px]">
              <Reveal delay={reduced ? 0 : i * 0.05} inView variant="scale">
                <Link
                  href={`/account/${a.id}`}
                  className="group relative block overflow-hidden rounded-2xl border border-success/30 bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-success"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {a.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={a.image}
                        alt={a.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="font-display text-sm text-white/90">{a.game}</span>
                      <span className="rounded-lg bg-success/15 px-2 py-1 text-sm font-bold text-success border border-success/30">
                        {formatPrice(a.price)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-white/5 p-4">
                    <h3 className="font-display text-base text-foreground truncate">{a.title}</h3>
                    <p className="text-xs text-muted-foreground">{a.platform}</p>
                  </div>
                </Link>
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
