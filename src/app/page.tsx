import Link from "next/link";
import {
  ArrowRight,
  Coins,
  ShieldCheck,
  MessagesSquare,
  Search as SearchIcon,
  Wallet,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import { ShopGrid } from "@/components/home/shop-grid";
import { HeroSearch } from "@/components/home/hero-search";
import { FaqAccordion, type FaqItem } from "@/components/home/faq-accordion";
import { Reviews } from "@/components/home/reviews";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { discord } from "@/config/site";
import { getAllProducts } from "@/lib/server-store";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: SearchIcon, title: "1. Pick your item", body: "Browse Adopt Me!, MM2, Grow a Garden, SAB, and Donut SMP items. Real-time stock." },
  { icon: Wallet, title: "2. Pay with crypto", body: "Checkout with USDT (BEP20) or Litecoin. Scan a QR, send the exact amount." },
  { icon: MessagesSquare, title: "3. Open a Discord ticket", body: "After payment you land on a Discord ticket with your order ID. Confirm and chat." },
  { icon: PackageCheck, title: "4. Receive in-game", body: "The owner trades the item into your game inventory once the ticket is verified." },
];

const trustItems: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: MessagesSquare, title: "Discord delivery", body: "Every order is fulfilled via a Discord ticket — fast and trackable." },
  { icon: Coins, title: "Crypto-only checkout", body: "No card fees, no chargebacks. Pay with USDT (BEP20) or Litecoin." },
  { icon: ShieldCheck, title: "Owner-run store", body: "Single trusted seller, real-time stock, no marketplace middlemen." },
];

const faqItems: FaqItem[] = [
  { q: "How fast is delivery?", a: "After your crypto payment confirms, open a Discord ticket with your order ID. The owner confirms the payment and trades the item into your game inventory — usually within minutes." },
  { q: "Which payment methods do you accept?", a: "We accept USDT (BEP20 / BSC network) and Litecoin (LTC). Both are fast, secure, and private. No cards, no chargebacks." },
  { q: "Is my account safe?", a: "Yes. We never ask for your password or login details. Items are delivered via standard in-game trades. Your account will not be banned for using our services." },
  { q: "How do I place an order?", a: "Browse the shop, add your desired items to the cart, proceed to checkout, pick USDT or LTC, send the exact amount to the provided wallet, then open a Discord ticket with your order ID to receive your items." },
  { q: "How do I get support?", a: "Our team is available 24/7 on Discord. Click the Join Discord button anywhere on the site, open a ticket, and we'll help you right away." },
  { q: "Can I cancel or refund?", a: "Because items are delivered instantly via in-game trade, we cannot cancel or refund after delivery. If you encounter any issue, contact us on Discord and we'll resolve it as quickly as possible." },
];

export default async function HomePage() {
  const all = await getAllProducts();
  const totalStock = all.reduce((s, p) => s + p.stock, 0);

  return (
    <>
      {/* Compact hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-grid opacity-40" aria-hidden />
        <div className="aurora" aria-hidden />
        <div className="beams" aria-hidden />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="LootHub logo"
                width={72}
                height={72}
                className="h-16 w-16 rounded-2xl object-contain ring-2 ring-primary/40 shadow-[0_0_32px_-4px_rgba(124,58,237,0.6)]"
                preload
              />
              <div>
                <p className="font-display text-2xl leading-none tracking-wide">LootHub</p>
                <p className="text-xs text-muted-foreground">In-game items · Crypto checkout</p>
              </div>
            </div>
            <Badge variant="accent" className="px-3 py-1 text-xs">
              <Coins className="h-3.5 w-3.5" /> Crypto checkout · Discord delivery
            </Badge>
            <h1 className="mt-3 max-w-2xl font-display text-3xl leading-[1.08] text-foreground sm:text-5xl">
              In-game items.{" "}
              <span className="text-glow text-primary">Pay with crypto.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Adopt Me!, Murder Mystery 2, Grow a Garden, Steal a Brainrot &amp; Donut
              SMP. Pay USDT or LTC, then open a Discord ticket to receive your item in-game.
            </p>
            <div className="mt-4 hidden max-w-2xl sm:block">
              <HeroSearch />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a href="#shop" className={buttonVariants({ variant: "accent", size: "lg" })}>
                Shop items <ArrowRight className="h-4 w-4" />
              </a>
              <Link href={discord.ticketUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>
                <MessagesSquare className="h-4 w-4" /> Join Discord
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatCount(all.length)} items · {formatCount(totalStock)} in stock
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Shop — visible immediately, no scroll */}
      <section id="shop" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-2 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Shop</p>
            <h2 className="font-display text-2xl sm:text-3xl">All items</h2>
          </div>
          <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Full browse <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ShopGrid products={all} />
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="How it works" title="From cart to in-game in four steps" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <SpotlightCard key={s.title} className="flex flex-col p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-base">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Trust" title="Safe, fast, owner-run" />
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {trustItems.map((t) => (
            <SpotlightCard key={t.title} className="flex flex-col p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <t.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-base">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Reviews" title="What our customers say" />
        <div className="mt-8"><Reviews /></div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-8"><FaqAccordion items={faqItems} /></div>
      </section>

      {/* Discord CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#5865F2]/40 bg-gradient-to-br from-[#5865F2]/25 via-surface to-accent/15 p-8 sm:p-12">
          <div className="absolute inset-0 -z-10 bg-grid opacity-40" aria-hidden />
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="max-w-xl font-display text-2xl leading-tight sm:text-3xl">
                Deliveries happen on Discord.
              </h2>
              <p className="mt-2 max-w-lg text-muted-foreground">
                After paying with crypto, you open a ticket in {discord.serverName},
                share your order ID, and receive your item via in-game trade.
              </p>
            </div>
            <Link
              href={discord.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }), "shrink-0")}
            >
              <MessagesSquare className="h-5 w-5" /> Join Discord
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-1 font-display text-2xl sm:text-3xl">{title}</h2>
    </div>
  );
}