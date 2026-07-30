import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import {
  addProduct,
  getAllProducts,
  saveUploadedImage,
} from "@/lib/server-store";
import { games } from "@/config/games";
import type { Game, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  const gameRaw = String(form.get("game") ?? "").trim();
  const priceRaw = String(form.get("price") ?? "").trim();
  const stockRaw = String(form.get("stock") ?? "").trim();
  const rarity = String(form.get("rarity") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const tagsRaw = String(form.get("tags") ?? "").trim();
  const image = form.get("image");

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!games.includes(gameRaw as Game)) {
    return NextResponse.json({ error: "Unknown game." }, { status: 400 });
  }
  const price = Number(priceRaw);
  if (Number.isNaN(price) || price < 0.5) {
    return NextResponse.json({ error: "Price must be at least $0.50." }, { status: 400 });
  }
  const stock = Math.max(1, Math.floor(Number(stockRaw) || 1));
  if (!description) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }

  const id = `item-${Date.now().toString(36)}`;
  const imageFile = image instanceof File && image.size > 0 ? image : null;
  // Backstop only: the admin form compresses covers client-side first.
  // 4 MB keeps this under the ~4.5 MB serverless request-body limit.
  if (imageFile && imageFile.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 4 MB." }, { status: 400 });
  }
  if (imageFile && !imageFile.type.startsWith("image/")) {
    return NextResponse.json({ error: "Cover must be an image file." }, { status: 400 });
  }
  const imagePath = imageFile ? await saveUploadedImage(id, imageFile) : undefined;

  const product: Product = {
    id,
    title,
    game: gameRaw as Game,
    price,
    rarity: rarity || undefined,
    stock,
    description,
    tags: tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    coverSeed: title,
    image: imagePath,
    featured: false,
  };

  await addProduct(product);
  return NextResponse.json({ product }, { status: 201 });
}
