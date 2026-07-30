import Link from "next/link";
import { Package, Boxes } from "lucide-react";
import { ProductCover } from "./product-cover";
import { SpotlightCard } from "./ui/spotlight-card";
import { Badge } from "./ui/badge";
import { CardActions } from "./card-actions";
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
  const low = product.stock > 0 && product.stock <= 5;

  return (
    <SpotlightCard
      as="article"
      className={cn(
        "group flex h-full flex-col",
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
          className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {product.rarity && <Badge variant="default">{product.rarity}</Badge>}
          {product.featured && <Badge variant="accent">Featured</Badge>}
        </div>
        {/* stock indicator */}
        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-none border-2 border-border bg-background px-2 py-1 font-display text-[8px] uppercase">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-none",
              product.stock <= 0 ? "bg-destructive" : low ? "bg-accent" : "bg-success",
            )}
            aria-hidden
          />
          {product.stock <= 0 ? "Sold out" : low ? `Only ${product.stock} left` : `${product.stock} in stock`}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 border-t-2 border-border p-4">
        <div className="flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-secondary" aria-hidden />
          <span className="font-display text-[8px] uppercase text-secondary">{product.game}</span>
        </div>

        <Link
          href={`/product/${product.id}`}
          className="font-display text-[11px] leading-relaxed text-foreground transition-colors hover:text-primary"
        >
          <span className="line-clamp-2">{product.title}</span>
        </Link>

        <div className="mt-auto space-y-3 pt-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-sm text-accent">{formatPrice(product.price)}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Boxes className="h-3.5 w-3.5" aria-hidden /> Discord
            </span>
          </div>
          <CardActions product={product} />
        </div>
      </div>
    </SpotlightCard>
  );
}
