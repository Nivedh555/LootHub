"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { games, gameMeta } from "@/config/games";
import type { Product } from "@/lib/types";

interface GamesGridProps {
  products: Product[];
}

export function GamesGrid({ products }: GamesGridProps) {
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGsapReveal(headRef, { variant: "fade-up", start: "top 88%" });
  useGsapReveal(gridRef, { variant: "scale-in", stagger: 0.07, start: "top 85%" });

  const countByGame = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.game] = (acc[p.game] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section
      id="games"
      className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"
      aria-labelledby="games-heading"
    >
      {/* Section number backdrop */}
      <span className="pointer-events-none absolute -right-4 -top-6 select-none font-display text-[10rem] font-black leading-none text-foreground/[0.02] sm:text-[13rem]" aria-hidden>
        02
      </span>

      <div className="relative">
      <div ref={headRef} className="mb-10">
        <p className="eyebrow mb-3">Browse by Game</p>
        <h2
          id="games-heading"
          className="font-display text-3xl font-black leading-tight text-foreground sm:text-4xl"
        >
          Your Game,<br />Your Loot.
        </h2>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {games.map((g) => {
          const meta = gameMeta[g];
          const count = countByGame[g] ?? 0;
          return (
            <div key={g} data-reveal>
              <Link
                href={`/browse?game=${encodeURIComponent(g)}`}
                className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_40px_-12px_rgba(109,40,217,0.3)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                  <Image
                    src={meta.icon}
                    alt={g}
                    fill
                    className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={90}
                    unoptimized
                  />
                  {/* Overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `radial-gradient(circle at center, ${meta.glow}, transparent 70%)` }}
                    aria-hidden
                  />
                </div>
                <div className="border-t border-border/60 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-sm font-bold text-foreground">{g}</h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {count > 0 ? `${count} item${count !== 1 ? "s" : ""}` : "Coming soon"} · {meta.platform}
                      </p>
                    </div>
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-2 text-muted-foreground transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/15 group-hover:text-primary"
                    >
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
