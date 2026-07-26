import type { Metadata } from "next";
import { findProductById, getAllProducts } from "@/lib/server-store";
import { ProductView } from "@/components/product/product-view";
import { AutoRefresh } from "@/components/auto-refresh";
import NotFoundItem from "./not-found";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await findProductById(id);
  if (!product) return { title: "Item not found" };
  return {
    title: product.title,
    description: `${product.title} — ${product.game} item. ${product.description}`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const all = await getAllProducts();
  const product = all.find((p) => p.id === id);
  if (!product) return <NotFoundItem />;

  const related = all
    .filter((p) => p.id !== product.id && p.game === product.game)
    .concat(all.filter((p) => p.id !== product.id && p.game !== product.game))
    .slice(0, 4);

  return (
    <>
      <AutoRefresh />
      <ProductView product={product} related={related} />
    </>
  );
}
