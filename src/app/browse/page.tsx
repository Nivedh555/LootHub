import type { Metadata } from "next";
import { BrowseClient } from "@/components/browse/browse-client";
import { getAllProducts } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse items",
  description:
    "Browse in-game items for Adopt Me!, Murder Mystery 2, Grow a Garden, Steal a Brainrot, and Donut SMP. Crypto checkout with USDT (BEP20) or Litecoin, delivery via Discord.",
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const game = typeof sp.game === "string" ? sp.game : "";
  const all = await getAllProducts();

  return <BrowseClient key={`${q}|${game}`} products={all} initialQ={q} initialGame={game} />;
}