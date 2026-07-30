import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Coins,
  ShieldCheck,
  MessagesSquare,
  Search as SearchIcon,
  Wallet,
  PackageCheck,
  PackageOpen,
  type LucideIcon,
} from "lucide-react";
import { ShopGrid } from "@/components/home/shop-grid";
import { AutoRefresh } from "@/components/auto-refresh";
import { DiscordButton } from "@/components/discord-button";
import { HeroSearch } from "@/components/home/hero-search";
import { FaqAccordion, type FaqItem } from "@/components/home/faq-accordion";
import { FeaturedCarousel } from "@/components/home/featured-carousel";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { LootCrateHero } from "@/components/ui/loot-crate-hero";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Reveal, RevealGroup, RevealBadge } from "@/components/ui/reveal";
import { NumberTicker } from "@/components/ui/number-ticker";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { discord } from "@/config/site";
import { games, gameMeta } from "@/config/games";
import { getAllProducts } from "@/lib/server-store";

export const dynamic = "force-dynamic";

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: SearchIcon, title: "Pick your item", body: "Browse Adopt Me!, MM2, Grow a Garden, SAB, and Donut SMP items. Real-time stock." },
  { icon: Wallet, title: "Pay with crypto", body: "Checkout with USDT (BEP20) or Litecoin. Scan a QR, send the exact amount." },
  { icon: MessagesSquare, title: "Open a ticket", body: "After payment you land on a Discord ticket with your order ID. Confirm and chat." },
  { icon: PackageCheck, title: "Receive in-game", body: "The owner trades the item into your game inventory once the ticket is verified." },
];

const trustItems: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: MessagesSquare, title: "Discord delivery", body: "Every order is fulfilled via a Discord ticket — fast and trackable." },
  { icon: Coins, title: "Crypto-only checkout", body: "No card fees, no chargebacks. Pay with USDT (BEP20) or Litecoin." },
  { icon: ShieldCheck, title: "Owner-run store", body: "Single trusted seller, real-time stock, no marketplace middlemen." },
];

const faqItems: FaqItem[] = [
  { q: "How fast is delivery?", a: "After your crypto payment confirms, open a Discord ticket with your order ID. The owner confirms the payment and trades the item into your game inventory — usually within minutes." },
  { q: "Which payment methods do you accept?", a: "We accept USDT (BEP20 / BSC network) and Litecoin (LTC). Both are fast, secure, and private. No cards, no chargebacks." },
  { q: "Is my account safe?", a: "We never ask for your password or login details. Items are delivered via standard in-game trades." },
  { q: "How do I place an order?", a: "Browse the shop, add your desired items to the cart, proceed to checkout, pick USDT or LTC, send the exact amount to the provided wallet, then open a Discord ticket with your order ID to receive your items." },
  { q: "How do I get support?", a: "Our team is available 24/7 on Discord. Click the Join Discord button anywhere on the site, open a ticket, and we'll help you right away." },
  { q: "Can I cancel or refund?", a: "Because items are delivered instantly via in-game trade, we cannot cancel or refund after delivery. If you encounter any issue, contact us on Discord and we'll resolve it as quickly as possible." },
];

export default async function HomePage() {
  const all = await getAllProducts();
  const totalStock = all.reduce((s, p) => s + p.stock, 0);

  return (
    <>
      <AutoRefresh />
      {/* Hero — dense, two-column, crate animation */}
      <section className="relative -mt-[4.5rem] overflow-hidden border-b border-border pt-[4.5rem]">
        <AmbientGlow />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_360px] lg:gap-4">
          <div>
            <RevealBadge>
              <Badge className="px-3 py-1 text-xs">
                <Coins className="h-3.5 w-3.5" /> Crypto checkout · Discord delivery
              </Badge>
            </RevealBadge>
            <h1 className="mt-3 max-w-2xl font-display text-3xl leading-[1.12] text-foreground sm:text-[2.75rem]">
              <Reveal variant="clip" inView delay={0.05} className="block">
                In-game items.{" "}
              </Reveal>
              <Reveal variant="clip" inView delay={0.13} className="block">
                <span className="text-glow text-primary">Pay with crypto.</span>
              </Reveal>
            </h1>
            <Reveal variant="rise" inView delay={0.1}>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                Adopt Me!, Murder Mystery 2, Grow a Garden, Steal a Brainrot &amp; Donut
                SMP. Pay USDT or LTC, then open a Discord ticket to receive your item in-game.
              </p>
            </Reveal>
            <Reveal variant="rise" inView delay={0.14}>
              <div className="mt-5 hidden max-w-xl sm:block">
                <HeroSearch />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a href="#shop" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  Shop items <ArrowRight className="h-4 w-4" />
                </a>
                <DiscordButton size="lg" />
              </div>
            </Reveal>
            {/* stat strip */}
            <Reveal variant="rise" inView delay={0.22}>
              <div className="mt-6 grid max-w-md grid-cols-3 divide-x divide-border rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <Stat value={all.length} label="Items listed" />
                <Stat value={totalStock} label="In stock" />
                <Stat value={games.length} label="Games" />
              </div>
            </Reveal>
          </div>
          <div className="hidden justify-center lg:flex">
            <LootCrateHero size={330} />
          </div>
        </div>
      </section>

      {/* Featured carousel */}
      {all.length > 0 && (
        <section id="featured" className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <SectionHeading eyebrow="Featured" title="Trending loot" />
          <div className="mt-6">
            <FeaturedCarousel products={all} />
          </div>
        </section>
      )}

      {/* Shop */}
      <section id="shop" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Reveal inView>
          <div className="mb-2 flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Shop" title="All items" />
            <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Full browse <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        {all.length > 0 ? (
          <ShopGrid products={all} />
        ) : (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground" aria-hidden />
            <div>
              <h3 className="font-display text-lg">Stock is being updated</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                New items are on the way. Join the Discord to get notified the moment fresh stock drops.
              </p>
            </div>
            <DiscordButton />
          </div>
        )}
      </section>

      {/* Games */}
      <section id="games" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeading eyebrow="Games" title="Browse by Game" />
        <RevealGroup
          inView
          variant="scale"
          staggerChildren={0.05}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {games.map((g) => {
            const meta = gameMeta[g];
            return (
              <Link
                key={g}
                href={`/browse?game=${encodeURIComponent(g)}`}
                className="group relative block overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5"
                style={{ borderColor: `${meta.color}4D`, "--hover-color": meta.color } as React.CSSProperties}
              >
                <div className="relative aspect-[5/3] overflow-hidden">
                  <Image
                    src={meta.icon}
                    alt={g}
                    fill
                    className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.05]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-lg text-white">{g}</h3>
                    <span
                      className="mt-1 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: meta.glow, color: meta.color }}
                    >
                      {meta.platform}
                    </span>
                  </div>
                </div>
                {/* Hover border brighten to 100% opacity */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ border: `1px solid ${meta.color}`, boxShadow: `0 0 24px -8px ${meta.glow}` }}
                />
              </Link>
            );
          })}
        </RevealGroup>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeading eyebrow="How it works" title="From cart to in-game in four steps" />
        <RevealGroup
          inView
          variant="scale"
          staggerChildren={0.06}
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((s, i) => (
            <SpotlightCard key={s.title} className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-2xl font-bold text-primary/30">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-4 font-display text-base">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </SpotlightCard>
          ))}
        </RevealGroup>
      </section>

      {/* Trust */}
      <section id="trust" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeading eyebrow="Trust" title="Safe, fast, owner-run" />
        <RevealGroup
          inView
          variant="scale"
          staggerChildren={0.06}
          className="mt-6 grid gap-5 sm:grid-cols-3"
        >
          {trustItems.map((t) => (
            <SpotlightCard key={t.title} className="flex h-full flex-col p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <t.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-base">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
            </SpotlightCard>
          ))}
        </RevealGroup>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-6"><FaqAccordion items={faqItems} /></div>
      </section>

      {/* Discord CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <Reveal inView>
          <div className="relative overflow-hidden rounded-3xl border border-[#5865F2]/40 bg-gradient-to-br from-[#5865F2]/25 via-surface to-primary/15 p-8 sm:p-10">
            <AmbientGlow className="opacity-60" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="max-w-xl font-display text-2xl leading-tight sm:text-3xl">
                  Deliveries happen on Discord.
                </h2>
                <p className="mt-2 max-w-lg text-muted-foreground">
                  After paying with crypto, you open a ticket in {discord.serverName},
                  share your order ID, and receive your item via in-game trade.
                </p>
              </div>
              <DiscordButton size="lg" className="shrink-0" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="font-display text-xl font-bold text-foreground">
        <NumberTicker value={value} className="text-foreground" />
      </p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}


