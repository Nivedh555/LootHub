import Link from "next/link";
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
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { PixelHeroLoader } from "@/components/ui/pixel-hero-loader";
import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { discord } from "@/config/site";
import { games, gameMeta } from "@/config/games";
import { GameIcon } from "@/components/game-icon";
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
      {/* Hero — pixel rocket canvas backdrop with overlaid content */}
      <section className="relative -mt-[4.5rem] flex min-h-[85vh] items-center overflow-hidden border-b-2 border-border pt-[4.5rem]">
        <PixelHeroLoader />
        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-14 text-center sm:px-6">
          <BlurFade inView>
            <Badge>
              <Coins className="h-3.5 w-3.5" aria-hidden /> Crypto checkout · Discord delivery
            </Badge>
            <h1 className="mt-6 font-display text-2xl leading-[1.5] text-pixel sm:text-4xl sm:leading-[1.4]">
              In-game items.
              <br />
              <span className="text-primary">Pay with crypto.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground sm:text-base">
              Adopt Me!, Murder Mystery 2, Grow a Garden, Steal a Brainrot &amp; Donut
              SMP. Pay USDT or LTC, then open a Discord ticket to receive your item in-game.
            </p>
          </BlurFade>
          <BlurFade inView delay={0.1}>
            <div className="mx-auto mt-8 hidden max-w-xl sm:block">
              <HeroSearch />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a href="#shop" className={buttonVariants({ variant: "primary", size: "lg" })}>
                Shop items <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <DiscordButton size="lg" />
            </div>
          </BlurFade>
          <BlurFade inView delay={0.18}>
            <div className="mx-auto mt-10 grid max-w-md grid-cols-3 rounded-none border-2 border-border bg-background/80 divide-x-2 divide-border">
              <Stat value={all.length} label="Items listed" />
              <Stat value={totalStock} label="In stock" />
              <Stat value={games.length} label="Games" />
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Featured carousel */}
      {all.length > 0 && (
        <section id="featured" className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <BlurFade inView>
            <SectionHeading eyebrow="Featured" title="Trending loot" />
          </BlurFade>
          <div className="mt-6">
            <FeaturedCarousel products={all} />
          </div>
        </section>
      )}

      {/* Shop */}
      <section id="shop" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <BlurFade inView>
          <div className="mb-2 flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Shop" title="All items" />
            <Link
              href="/browse"
              className="inline-flex items-center gap-1 font-display text-[10px] uppercase text-secondary hover:underline"
            >
              Full browse <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </BlurFade>
        {all.length > 0 ? (
          <ShopGrid products={all} />
        ) : (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-none border-2 border-dashed border-border bg-card px-6 py-14 text-center">
            <PackageOpen className="h-10 w-10 text-secondary" aria-hidden />
            <div>
              <h3 className="font-display text-sm leading-relaxed">Stock is being updated</h3>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                New items are on the way. Join the Discord to get notified the moment fresh stock drops.
              </p>
            </div>
            <DiscordButton />
          </div>
        )}
      </section>

      {/* Games */}
      <section id="games" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <BlurFade inView>
          <SectionHeading eyebrow="Games" title="Games supported" />
        </BlurFade>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
          {games.map((g) => {
            const meta = gameMeta[g];
            return (
              <BlurFade key={g} inView>
                <Link href={`/browse?game=${encodeURIComponent(g)}`} className="group block h-full">
                  <SpotlightCard
                    spotlightColor={meta.glow}
                    borderColor={meta.color}
                    className="flex h-full flex-col p-5 transition-transform duration-200 group-hover:-translate-y-1"
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-none border-2"
                      style={{ borderColor: meta.color }}
                    >
                      <GameIcon game={g} className="h-12 w-12 rounded-none" />
                    </span>
                    <h3 className="mt-4 font-display text-[11px] leading-relaxed sm:text-xs">{g}</h3>
                    <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{meta.blurb}</p>
                    <span
                      className="mt-4 inline-flex w-fit items-center rounded-none border-2 px-2 py-1 font-display text-[9px] uppercase"
                      style={{ borderColor: meta.color, color: meta.color }}
                    >
                      {meta.platform}
                    </span>
                  </SpotlightCard>
                </Link>
              </BlurFade>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <BlurFade inView>
          <SectionHeading eyebrow="How it works" title="From cart to in-game in four steps" />
        </BlurFade>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <BlurFade key={s.title} inView delay={i * 0.06} className="h-full">
              <SpotlightCard className="flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-none border-2 border-secondary bg-background text-secondary">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="font-display text-lg text-primary/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[11px] leading-relaxed">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </SpotlightCard>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <BlurFade inView>
          <SectionHeading eyebrow="Trust" title="Safe, fast, owner-run" />
        </BlurFade>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {trustItems.map((t) => (
            <BlurFade key={t.title} inView className="h-full">
              <SpotlightCard className="flex h-full flex-col p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-none border-2 border-primary bg-background text-primary">
                  <t.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-[11px] leading-relaxed">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
              </SpotlightCard>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <BlurFade inView>
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        </BlurFade>
        <BlurFade inView delay={0.08}>
          <div className="mt-6"><FaqAccordion items={faqItems} /></div>
        </BlurFade>
      </section>

      {/* Discord CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <BlurFade inView>
          <div className="relative overflow-hidden rounded-none border-2 border-[#5865F2] bg-surface p-8 pixel-shadow-dark sm:p-10">
            <div className="pointer-events-none absolute inset-0 pixel-stars opacity-40" aria-hidden />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="max-w-xl font-display text-base leading-relaxed sm:text-lg">
                  Deliveries happen on Discord.
                </h2>
                <p className="mt-4 max-w-lg text-muted-foreground">
                  After paying with crypto, you open a ticket in {discord.serverName},
                  share your order ID, and receive your item via in-game trade.
                </p>
              </div>
              <DiscordButton size="lg" className="shrink-0" />
            </div>
          </div>
        </BlurFade>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="font-display text-sm text-accent">
        <NumberTicker value={value} className="text-accent" />
      </p>
      <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-display text-[9px] uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-base leading-relaxed sm:text-xl">{title}</h2>
    </div>
  );
}
