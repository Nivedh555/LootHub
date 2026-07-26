"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Package } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getGameIcon } from "@/components/game-icon";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { games } from "@/config/games";
import type { Product } from "@/lib/types";

type Sort = "featured" | "price-asc" | "price-desc" | "az";

export function ShopGrid({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [game, setGame] = useState<string>("All");
  const [sort, setSort] = useState<Sort>("featured");

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of products) m[p.game] = (m[p.game] ?? 0) + 1;
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (game !== "All" && p.game !== game) return false;
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
  }, [products, q, game, sort]);

  const active = (game !== "All" ? 1 : 0) + (q.trim() ? 1 : 0);

  return (
    <div>
      {/* Game chips + search row */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <GameChip active={game === "All"} onClick={() => setGame("All")} label="All" count={products.length} />
          {games.map((g) => {
            const Icon = getGameIcon(g);
            return (
              <GameChip
                key={g}
                active={game === g}
                onClick={() => setGame(g)}
                label={g}
                icon={<Icon className="h-3.5 w-3.5" aria-hidden />}
                count={counts[g] ?? 0}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search items…"
              className="h-10 pl-9"
              aria-label="Search items"
            />
          </div>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-10 w-auto py-0 text-xs"
            aria-label="Sort items"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="az">A–Z</option>
          </Select>
        </div>
      </div>

      {active > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span>
            {game !== "All" && <> in <span className="font-semibold text-secondary">{game}</span></>}
          </p>
          <button
            type="button"
            onClick={() => { setQ(""); setGame("All"); }}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Package className="h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="font-display">No items match.</p>
          <p className="text-sm text-muted-foreground">Try another game or clear the search.</p>
          <Button variant="outline" size="sm" onClick={() => { setQ(""); setGame("All"); }}>
            <SlidersHorizontal className="h-4 w-4" /> Reset
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function GameChip({
  active,
  onClick,
  label,
  icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50",
      )}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
      <span className={cn("text-[10px]", active ? "text-primary-foreground/80" : "text-muted-foreground/70")}>
        {formatCount(count)}
      </span>
    </button>
  );
}