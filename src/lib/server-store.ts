import { promises as fs } from "node:fs";
import path from "node:path";
import { products as seedProducts, getProductById } from "./products";
import type { Product } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

async function readStore(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
}

async function writeStore(arr: Product[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(arr, null, 2), "utf-8");
}

export async function getUploadedProducts(): Promise<Product[]> {
  return readStore();
}

export async function getAllProducts(): Promise<Product[]> {
  const uploaded = await readStore();
  return [...uploaded, ...seedProducts];
}

export async function findProductById(id: string): Promise<Product | undefined> {
  const seed = getProductById(id);
  if (seed) return seed;
  return (await readStore()).find((p) => p.id === id);
}

export async function addUploadedProduct(input: Product): Promise<Product> {
  const arr = await readStore();
  await writeStore([input, ...arr]);
  return input;
}

export async function removeUploadedProduct(id: string): Promise<void> {
  const arr = await readStore();
  const target = arr.find((p) => p.id === id);
  if (target?.image?.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", target.image.slice(1));
    await fs.rm(filePath, { force: true });
  }
  await writeStore(arr.filter((p) => p.id !== id));
}

export async function saveUploadedImage(id: string, file: File): Promise<string> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const rawExt = (file.name.split(".").pop() ?? "png").toLowerCase();
  const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : "png";
  const filename = `${id}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}