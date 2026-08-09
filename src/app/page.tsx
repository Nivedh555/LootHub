import { AutoRefresh } from "@/components/auto-refresh";
import { MinecraftBg } from "@/components/minecraft-bg";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { TrendingProducts } from "@/components/home/trending-products";
import { GamesGrid } from "@/components/home/games-grid";
import { FeaturedDrop } from "@/components/home/featured-drop";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyLootHub } from "@/components/home/why-loothub";
import { FaqAccordion, type FaqItem } from "@/components/home/faq-accordion";
import { FinalCTA } from "@/components/home/final-cta";
import { getAllProducts } from "@/lib/server-store";

export const dynamic = "force-dynamic";

const faqItems: FaqItem[] = [
  {
    q: "How fast is delivery?",
    a: "After your crypto payment confirms, open a Discord ticket with your order ID. The owner confirms the payment and trades the item into your game inventory — usually within minutes.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept USDT (BEP20 / BSC network) and Litecoin (LTC). Both are fast, secure, and private. No cards, no chargebacks.",
  },
  {
    q: "Is my account safe?",
    a: "We never ask for your password or login details. Items are delivered via standard in-game trades.",
  },
  {
    q: "How do I place an order?",
    a: "Browse the shop, add your desired items to the cart, proceed to checkout, pick USDT or LTC, send the exact amount to the provided wallet, then open a Discord ticket with your order ID to receive your items.",
  },
  {
    q: "How do I get support?",
    a: "Our team is available 24/7 on Discord. Click the Join Discord button anywhere on the site, open a ticket, and we'll help you right away.",
  },
  {
    q: "Can I cancel or refund?",
    a: "Because items are delivered instantly via in-game trade, we cannot cancel or refund after delivery. If you encounter any issue, contact us on Discord and we'll resolve it as quickly as possible.",
  },
];

export default async function HomePage() {
  const all = await getAllProducts();

  // Pick the best featured product for the hero / featured drop
  const featuredProduct =
    all.find((p) => p.featured && p.stock > 0) ??
    all.find((p) => p.stock > 0) ??
    null;

  // Featured drop: try to find a different product from hero, otherwise same
  const featuredDrop =
    all.find((p) => p.featured && p.stock > 0 && p.id !== featuredProduct?.id) ??
    featuredProduct;

  return (
    <>
      <AutoRefresh />
      <MinecraftBg />

      {/* 1. Hero */}
      <Hero featuredProduct={featuredProduct} totalItems={all.length} />

      {/* 2. Trust strip */}
      <TrustStrip />

      {/* 3. Trending products */}
      <TrendingProducts products={all} />

      {/* 4. Browse by game */}
      <GamesGrid products={all} />

      {/* 5. Featured drop — only render if there's a product */}
      {featuredDrop && <FeaturedDrop product={featuredDrop} />}

      {/* 6. How it works */}
      <HowItWorks />

      {/* 7. Why LootHub */}
      <WhyLootHub />

      {/* 8. FAQ */}
      <FaqAccordion items={faqItems} />

      {/* 9. Final CTA */}
      <FinalCTA />
    </>
  );
}
