import type { Metadata } from "next";
import { products } from "@/lib/products";
import { findProductById } from "@/lib/server-store";
import { ProductView } from "@/components/product/product-view";
import NotFoundItem from "./not-found";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

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
  const seed = products.find((p) => p.id === id);
  if (seed) {
    return <ProductView product={seed} />;
  }
  const uploaded = await findProductById(id);
  if (uploaded) {
    return <ProductView product={uploaded} />;
  }
  return <NotFoundItem />;
}