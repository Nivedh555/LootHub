"use client";

import Link from "next/link";
import Image from "next/image";
import { Gamepad2, ShoppingCart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import type { GameAccount } from "@/lib/types";

export function GameAccountsGrid({ accounts }: { accounts: GameAccount[] }) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        <Gamepad2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        No game accounts available right now. Check back soon!
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((a) => (
        <div
          key={a.id}
          className={cn(
            "group relative overflow-hidden rounded-2xl border transition-all duration-300",
            "border-success/30 bg-surface hover:scale-[1.02] hover:border-success hover:shadow-[0_0_24px_-8px_rgba(34,197,94,0.25)]"
          )}
        >
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <Image
              src={a.image || "/images/game-account-placeholder.png"}
              alt={a.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-success">
                <Sparkles className="h-3 w-3" /> Account
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <p className="font-display text-sm text-white/90">{a.game}</p>
                <p className="text-xs text-white/70">{a.platform}</p>
              </div>
              <span className="rounded-lg bg-success/15 px-2 py-1 text-sm font-bold text-success border border-success/30">
                {formatPrice(a.price)}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="truncate font-display text-base font-semibold text-foreground transition-colors group-hover:text-primary">
              {a.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {a.description || "Premium game account. Instant delivery via Discord."}
            </p>
            {a.tags && a.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {a.tags.map((t) => (
                  <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary border border-primary/20">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{a.stock} available</span>
              <Link
                href={`/account/${a.id}`}
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                <ShoppingCart className="h-4 w-4" /> Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
