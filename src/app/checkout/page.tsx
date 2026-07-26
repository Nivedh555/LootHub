"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  Check,
  Coins,
  ArrowRight,
  Clock,
  Wallet,
  PartyPopper,
  MessagesSquare,
  Package,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { cryptoAssets } from "@/config/payments";
import { discord } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, count, clear } = useCart();
  const [assetId, setAssetId] = useState(cryptoAssets[0].id);
  const [copied, setCopied] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [paid, setPaid] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paidAssetLabel, setPaidAssetLabel] = useState("");
  const [paidTotal, setPaidTotal] = useState(0);

  const asset = cryptoAssets.find((a) => a.id === assetId) ?? cryptoAssets[0];

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(asset.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked; user can still select manually
    }
  }

  async function copyOrder() {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedOrder(true);
      window.setTimeout(() => setCopiedOrder(false), 1800);
    } catch {
      // ignore
    }
  }

  function confirmPaid() {
    const id = `LH-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(id);
    setPaidAssetLabel(asset.label);
    setPaidTotal(subtotal);
    setPaid(true);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (paid) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-accent/40 bg-accent/10 p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <PartyPopper className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-2xl">Payment submitted</h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;re watching the blockchain for your {asset.symbol} payment. Open a
            Discord ticket now to claim your items once it confirms.
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-4 text-left text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Order ID</span>
              <span className="inline-flex items-center gap-2">
                <span className="font-mono">{orderId}</span>
                <button
                  type="button"
                  onClick={copyOrder}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Copy order ID"
                >
                  {copiedOrder ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>{formatPrice(paidTotal)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span>{paidAssetLabel}</span>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-left text-sm text-muted-foreground">
            <p className="flex gap-2"><span className="text-primary">1.</span> Click below to open {discord.serverName}.</p>
            <p className="flex gap-2"><span className="text-primary">2.</span> Open a ticket and paste your order ID.</p>
            <p className="flex gap-2"><span className="text-primary">3.</span> The owner confirms your crypto payment and trades the items to you in-game.</p>
          </div>

          <Link
            href={discord.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-6 w-full justify-center")}
          >
            <MessagesSquare className="h-5 w-5" /> Open a Discord ticket
          </Link>
          <Link
            href="/browse"
            className={cn(buttonVariants({ variant: "ghost" }), "mt-2 w-full justify-center")}
          >
            Keep browsing
          </Link>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Wallet className="h-8 w-8" />
        </span>
        <h1 className="font-display text-2xl">Nothing to check out</h1>
        <p className="max-w-md text-muted-foreground">
          Add items to your cart first, then pay with USDT (BEP20) or Litecoin and open a
          Discord ticket.
        </p>
        <Link href="/browse" className={buttonVariants({ variant: "accent", size: "lg" })}>
          Browse items <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl sm:text-4xl">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section>
          <h2 className="mb-4 font-display text-lg">Order review</h2>
          <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.product.title}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="h-3 w-3 text-secondary" aria-hidden />
                    {item.product.game} · {item.qty} × {formatPrice(item.product.price)}
                  </p>
                </div>
                <span className="text-sm">{formatPrice(item.product.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-3 font-display text-base">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
              <MessagesSquare className="h-5 w-5 text-[#8a93f5]" />
              Delivered via Discord
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
              <Clock className="h-5 w-5 text-secondary" />
              Fast on confirm
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg">Pay with crypto</h2>

          <div className="grid grid-cols-2 gap-3">
            {cryptoAssets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => { setAssetId(a.id); setCopied(false); }}
                className={cn(
                  "flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all",
                  a.id === assetId
                    ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(124,58,237,0.5)]"
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

          <div className="mt-5 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-2xl bg-[#0b0614] p-3">
                <QRCodeSVG
                  value={asset.deepLink(subtotal)}
                  size={184}
                  level="M"
                  marginSize={2}
                  bgColor="#0b0614"
                  fgColor="#f5f0ff"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Send the equivalent of{" "}
                  <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>{" "}
                  in {asset.symbol}
                </p>
                <p className="text-xs text-muted-foreground">Network: {asset.network}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Wallet address</span>
                <Badge variant="muted">{asset.network}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
                <code className="flex-1 break-all text-sm">{asset.address}</code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={copyAddress}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <ol className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">1.</span> Copy the {asset.symbol} address or scan the QR with your wallet.</li>
              <li className="flex gap-2"><span className="text-primary">2.</span> Send on the exact {asset.network} network. Wrong network = lost funds.</li>
              <li className="flex gap-2"><span className="text-primary">3.</span> Once paid, click &ldquo;I&apos;ve sent the payment&rdquo; to open a Discord ticket.</li>
            </ol>

            <Button
              type="button"
              size="lg"
              variant="accent"
              className="mt-6 w-full justify-center"
              onClick={confirmPaid}
            >
              <Check className="h-5 w-5" /> I&apos;ve sent the payment
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              After confirming, open a Discord ticket and paste your order ID to receive your items.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}