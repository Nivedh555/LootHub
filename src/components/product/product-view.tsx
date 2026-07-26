import Link from "next/link";
import { ChevronRight, Boxes, Coins, MessagesSquare, ShieldCheck, Package, Tag } from "lucide-react";
import { ProductCover } from "@/components/product-cover";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { ProductPurchase } from "@/components/product/product-purchase";
import { formatCount, formatPrice } from "@/lib/format";
import { discord } from "@/config/site";
import { gameMeta } from "@/components/game-icon";
import type { Product } from "@/lib/types";

export function ProductView({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href="/browse" className="hover:text-primary">Browse</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href={`/browse?game=${encodeURIComponent(product.game)}`} className="hover:text-primary">
          {product.game}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="truncate text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <ProductCover product={product} className="h-full w-full" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {product.rarity && <Badge variant="default">{product.rarity}</Badge>}
            {product.featured && <Badge variant="accent">Featured</Badge>}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-secondary">
              <Package className="h-4 w-4" aria-hidden />
              {product.game}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Tag className="h-4 w-4" aria-hidden /> {gameMeta[product.game].platform}
            </span>
          </div>

          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{product.title}</h1>
          <p className="max-w-prose text-muted-foreground">{product.description}</p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 text-accent" aria-hidden />
            <span>
              {product.stock > 0
                ? `${formatCount(product.stock)} available`
                : "Out of stock — restock soon"}
            </span>
            <span aria-hidden>·</span>
            <Boxes className="h-4 w-4 text-secondary" aria-hidden />
            <span>Delivered via in-game trade</span>
          </div>

          <ProductPurchase product={product} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Trust icon={MessagesSquare} label="Discord ticket" />
            <Trust icon={Coins} label="USDT · LTC" />
            <Trust icon={ShieldCheck} label="Owner-run" />
            <Trust icon={Boxes} label="In-game trade" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5865F2]/15 text-[#8a93f5]">
                <MessagesSquare className="h-5 w-5" aria-hidden />
              </span>
              <div className="flex-1">
                <div className="font-semibold">Pay crypto → open a Discord ticket</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  After checkout, you land in {discord.serverName} with your order ID. The
                  owner confirms and trades the item into your inventory.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((t) => (
              <span key={t} className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl">More like this</h2>
            <Link href={`/browse?game=${encodeURIComponent(product.game)}`} className="text-sm font-semibold text-primary hover:underline">
              More in {product.game}
            </Link>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            {product.title} · {formatPrice(product.price)} · {product.game} item.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function Trust({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
      <Icon className="h-4 w-4 text-primary" aria-hidden />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}