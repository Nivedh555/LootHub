"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Coins, MessagesSquare, ShieldCheck, Package, Tag, Zap, Gamepad2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cryptoAssets } from "@/config/payments";
import { discord } from "@/config/site";
import { formatCount, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PaymentInstructions, type PaymentOrder } from "@/components/payment-instructions";
import type { GameAccount } from "@/lib/types";

export function AccountView({
  account,
  related,
}: {
  account: GameAccount;
  related: GameAccount[];
}) {
  const [assetId, setAssetId] = useState(cryptoAssets[0].id);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [order, setOrder] = useState<PaymentOrder | null>(null);

  const outOfStock = account.stock <= 0;

  async function buyNow() {
    if (placing || outOfStock) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const res = await fetch("/api/account-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: account.id, asset: assetId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        order?: PaymentOrder;
        error?: string;
      };
      if (!res.ok || !data.order) {
        setPlaceError(data.error ?? "Could not place order. Try again or contact us on Discord.");
        return;
      }
      setOrder(data.order);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setPlaceError("Network error — check your connection and try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (order) {
    return (
      <PaymentInstructions
        order={order}
        onDone={() => setOrder(null)}
        extraNote={`Game account: ${account.title}`}
      />
    );
  }

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href="/accounts" className="hover:text-primary">Accounts</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="truncate text-foreground">{account.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            {account.image ? (
              <Image
                src={account.image}
                alt={account.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Gamepad2 className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {account.featured && <Badge variant="accent">Featured</Badge>}
            {outOfStock && <Badge variant="default" className="bg-destructive/15 text-destructive border-destructive/30">Sold out</Badge>}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-secondary">
              <Package className="h-4 w-4" aria-hidden />
              {account.game}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Tag className="h-4 w-4" aria-hidden /> {account.platform}
            </span>
          </div>

          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{account.title}</h1>
          <p className="max-w-prose text-muted-foreground">{account.description}</p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 text-accent" aria-hidden />
            <span>
              {account.stock > 0
                ? `${formatCount(account.stock)} available`
                : "Sold out — restock soon"}
            </span>
            <span aria-hidden>·</span>
            <Gamepad2 className="h-4 w-4 text-secondary" aria-hidden />
            <span>Full access account</span>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-end gap-3">
              <span className="font-display text-4xl text-accent">{formatPrice(account.price)}</span>
              {outOfStock && (
                <span className="mb-1.5 inline-flex items-center rounded-full border border-destructive/40 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                  Sold out
                </span>
              )}
              {!outOfStock && account.stock <= 3 && (
                <span className="mb-1.5 inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {account.stock} left
                </span>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment method</p>
              <div className="grid grid-cols-2 gap-3">
                {cryptoAssets.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAssetId(a.id)}
                    className={cn(
                      "flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all",
                      a.id === assetId
                        ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(16,185,129,0.5)]"
                        : "border-border bg-card hover:border-primary/50",
                    )}
                  >
                    <span className="flex items-center gap-2 font-display">
                      <Coins className="h-4 w-4 text-primary" /> {a.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">{a.network}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              variant="accent"
              disabled={outOfStock || placing}
              onClick={buyNow}
              className="w-full justify-center sm:w-auto"
            >
              <Zap className="h-5 w-5" />
              {placing ? "Placing order…" : outOfStock ? "Sold out" : `Buy now · ${formatPrice(account.price)}`}
            </Button>

            {placeError && (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {placeError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Trust icon={MessagesSquare} label="Discord delivery" />
            <Trust icon={Coins} label="USDT · LTC" />
            <Trust icon={ShieldCheck} label="Owner-run" />
            <Trust icon={Package} label="Full access" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5865F2]/15 text-[#8a93f5]">
                <MessagesSquare className="h-5 w-5" aria-hidden />
              </span>
              <div className="flex-1">
                <div className="font-semibold">Pay crypto → get account credentials</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  After checkout, you land in {discord.serverName} with your order ID. The
                  owner confirms and sends you the full account credentials via Discord.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {account.tags.map((t) => (
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
            <h2 className="font-display text-2xl">More accounts</h2>
            <Link href="/accounts" className="text-sm font-semibold text-primary hover:underline">
              Browse all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((a) => (
              <AccountCard key={a.id} account={a} />
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

function AccountCard({ account }: { account: GameAccount }) {
  return (
    <Link
      href={`/account/${account.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-success/30 bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-success"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {account.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={account.image} alt={account.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gamepad2 className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="font-display text-sm text-white/90">{account.game}</span>
          <span className="rounded-lg bg-success/15 px-2 py-1 text-sm font-bold text-success border border-success/30">
            {formatPrice(account.price)}
          </span>
        </div>
      </div>
      <div className="border-t border-white/5 p-4">
        <h3 className="font-display text-base text-foreground truncate">{account.title}</h3>
        <p className="text-xs text-muted-foreground">{account.platform}</p>
      </div>
    </Link>
  );
}
