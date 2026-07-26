import Link from "next/link";
import { Package, Sparkles, Boxes } from "lucide-react";
import { ProductCover } from "./product-cover";
import { SpotlightCard } from "./ui/spotlight-card";
import { Badge } from "./ui/badge";
import { AddToCart } from "./add-to-cart";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  return (
    <SpotlightCard
      as="article"
      className={cn(
        "group flex h-full flex-col transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_50px_-18px_rgba(124,58,237,0.5)]",
        className,
      )}
    >
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden"
        aria-label={product.title}
      >
        <ProductCover
          product={product}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.rarity && <Badge variant="default">{product.rarity}</Badge>}
          {product.featured && <Badge variant="accent">Featured</Badge>}
        </div>
        {product.local && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border">
            <Sparkles className="h-3 w-3" /> Your listing
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Package className="h-3.5 w-3.5 text-secondary" aria-hidden />
          <span className="font-semibold text-secondary">{product.game}</span>
        </div>

        <Link
          href={`/product/${product.id}`}
          className="font-display text-base leading-tight text-foreground transition-colors hover:text-primary"
        >
          <span className="line-clamp-2">{product.title}</span>
        </Link>

        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>

        <div className="flex items-center justify-between pt-3">
          <span className="font-display text-xl text-accent">{formatPrice(product.price)}</span>
          <AddToCart product={product} size="sm" label="Add" />
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Boxes className="h-3.5 w-3.5" aria-hidden />
          <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
        </div>
      </div>
    </SpotlightCard>
  );
}