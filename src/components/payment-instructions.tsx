"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Clock, ReceiptText, MessagesSquare, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { discord } from "@/config/site";
import { cryptoAssets } from "@/config/payments";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PaymentOrder {
  id: string;
  total: number;
  asset: "usdt" | "ltc";
  assetLabel: string;
}

export function PaymentInstructions({
  order,
  onDone,
  extraNote,
}: {
  order: PaymentOrder;
  onDone: () => void;
  extraNote?: string;
}) {
  const asset = cryptoAssets.find((a) => a.id === order.asset) ?? cryptoAssets[0];
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  async function copy(text: string, set: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      set(true);
      window.setTimeout(() => set(false), 1600);
    } catch {
      // clipboard blocked; user can still select manually
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success">
            <ReceiptText className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl">Order placed</h1>
            <p className="text-sm text-muted-foreground">
              Complete your {asset.symbol} payment
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="mt-6 rounded-2xl border border-border bg-surface p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Order ID</span>
            <span className="inline-flex items-center gap-2">
              <span className="font-mono font-semibold">{order.id}</span>
              <button
                type="button"
                onClick={() => copy(order.id, setCopiedOrder)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Copy order ID"
              >
                {copiedOrder ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Amount due</span>
            <span className="font-semibold">{formatPrice(order.total)} in {asset.symbol}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Method</span>
            <span>{order.assetLabel}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <Clock className="h-3.5 w-3.5" /> Awaiting payment
            </span>
          </div>
          {extraNote && (
            <div className="mt-2 rounded-xl border border-primary/20 bg-primary/10 p-2 text-xs text-primary">
              {extraNote}
            </div>
          )}
        </div>

        {/* Payment details */}
        <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-5">
          <div className="w-full text-center">
            <Badge variant="muted" className="mb-2 text-xs">
              {asset.label} — {asset.network}
            </Badge>
            <h2 className="font-display text-lg">{asset.symbol} Payment</h2>
          </div>
          <div className="rounded-2xl bg-[#0b0614] p-3">
            <QRCodeSVG
              value={asset.deepLink(order.total)}
              size={172}
              level="M"
              marginSize={2}
              bgColor="#0b0614"
              fgColor="#f5f0ff"
            />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Wallet address</span>
              <Badge variant="muted">{asset.network}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background p-3">
              <code className="flex-1 break-all text-sm">{asset.address}</code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copy(asset.address, setCopiedAddress)}
                className="shrink-0"
              >
                {copiedAddress ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedAddress ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-300">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Send only {asset.symbol} on the {asset.network} network. Funds sent on the
            wrong network cannot be recovered.
          </p>
        </div>

        {/* Next steps */}
        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
          <p className="flex gap-2">
            <span className="text-primary">1.</span> Send the equivalent of{" "}
            <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>{" "}
            in {asset.symbol} to the address above.
          </p>
          <p className="flex gap-2">
            <span className="text-primary">2.</span> Open a Discord ticket and paste your
            order ID.
          </p>
          <p className="flex gap-2">
            <span className="text-primary">3.</span> We verify the payment on the
            blockchain and send you the account credentials.
          </p>
        </div>

        <Link
          href={discord.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "accent", size: "lg" }),
            "mt-6 w-full justify-center",
          )}
        >
          <MessagesSquare className="h-5 w-5" /> Open a Discord ticket
        </Link>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Link
            href="/accounts"
            onClick={onDone}
            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-center")}
          >
            More accounts
          </Link>
          <button
            type="button"
            onClick={onDone}
            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-center")}
          >
            Done
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Keep your order ID — it&apos;s how we match your payment to your account.
        </p>
      </div>
    </div>
  );
}
