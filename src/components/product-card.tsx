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
        "group flex h-full flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[0_24px_60px_-20px_rgba(124,58,237,0.55)]",
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
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent opacity-70" aria-hidden />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.rarity && <Badge variant="default">{product.rarity}</Badge>}
          {product.featured && <Badge variant="accent">Featured</Badge>}
        </div>
        {/* stock indicator */}
        <div className="absolute bottom-2.5 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background/70 px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              product.stock <= 0 ? "bg-destructive" : low ? "bg-amber-400" : "bg-success",
            )}
            aria-hidden
          />
          {product.stock <= 0 ? "Sold out" : low ? `Only ${product.stock} left` : `${product.stock} in stock`}
        </div>
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

        <div className="mt-auto space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold text-foreground">{formatPrice(product.price)}</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Boxes className="h-3.5 w-3.5" aria-hidden /> Discord delivery
            </span>
          </div>
          <CardActions product={product} />
        </div>
      </div>
    </SpotlightCard>
  );
}
