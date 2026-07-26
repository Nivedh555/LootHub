"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { GameIcon } from "@/components/game-icon";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { games } from "@/config/games";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Game, Product } from "@/lib/types";

type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "az";
const MAX = 100;

export function BrowseClient({
  products,
  initialQ = "",
  initialGame = "",
}: {
  products: Product[];
  initialQ?: string;
  initialGame?: string;
}) {
  const [q, setQ] = useState(initialQ);
  const [game, setGame] = useState<string>(initialGame || "All");
  const [maxPrice, setMaxPrice] = useState<number>(MAX);
  const [sort, setSort] = useState<Sort>("featured");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (game !== "All" && p.game !== game) return false;
      if (p.price > maxPrice) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        (p.rarity ?? "").toLowerCase().includes(query)
      );
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return (b.rarity ?? "").length - (a.rarity ?? "").length || b.stock - a.stock;
        case "az":
          return a.title.localeCompare(b.title);
        default:
          return (
            Number(b.featured ?? false) - Number(a.featured ?? false) ||
            a.title.localeCompare(b.title)
          );
      }
    });
    return list;
  }, [products, q, game, maxPrice, sort]);

  const activeCount =
    (game !== "All" ? 1 : 0) + (maxPrice < MAX ? 1 : 0) + (q.trim() ? 1 : 0);

  function reset() {
    setQ("");
    setGame("All");
    setMaxPrice(MAX);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl">Marketplace</h1>
        <p className="mt-1 text-muted-foreground">
          {filtered.length} item{filtered.length === 1 ? "" : "s"} · crypto checkout · Discord delivery
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-wide">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <X className="h-3 w-3" /> Clear ({activeCount})
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search items…"
                    className="pl-9"
                    aria-label="Filter by text"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Game
                </p>
                <div className="flex flex-col gap-1">
                  <GameChip active={game === "All"} onClick={() => setGame("All")} label="All games" />
                  {games.map((g) => (
                    <GameChip
                      key={g}
                      active={game === g}
                      onClick={() => setGame(g as Game)}
                      label={g}
                      icon={<GameIcon game={g} className="h-4 w-4 rounded-[4px]" />}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Max price</span>
                  <span className="text-foreground">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={MAX}
                  step={1}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span>
              {game !== "All" && <> in <span className="font-semibold text-secondary">{game}</span></>}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs text-muted-foreground">Sort</label>
              <Select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-9 w-auto py-0 text-xs"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="az">A–Z</option>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState onReset={reset} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function GameChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50",
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
      <Search className="h-10 w-10 text-muted-foreground" aria-hidden />
      <div>
        <p className="font-display text-lg">No items match those filters</p>
        <p className="text-sm text-muted-foreground">Try a different game or relax your price filter.</p>
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>Clear filters</Button>
    </div>
  );
}