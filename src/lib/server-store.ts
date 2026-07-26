import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Order, Product } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
// Uploads live under data/ (not public/) because `next start` only serves
// public/ files that existed at build time — runtime uploads there 404.
// They are served by the dynamic route handler at src/app/uploads/[file]/route.ts.
export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

/**
 * Serialize all read-modify-write cycles through one promise chain so
 * concurrent requests can't clobber each other's writes.
 */
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(job, job);
  queue = run.catch(() => undefined);
  return run;
}

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf-8");
  await fs.rename(tmp, file);
}

// ---------- Products ----------

export async function getAllProducts(): Promise<Product[]> {
  return readJson<Product>(STORE_FILE);
}

export async function findProductById(id: string): Promise<Product | undefined> {
  return (await getAllProducts()).find((p) => p.id === id);
}

export async function addProduct(input: Product): Promise<Product> {
  return enqueue(async () => {
    const arr = await readJson<Product>(STORE_FILE);
    await writeJson(STORE_FILE, [input, ...arr]);
    return input;
  });
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>,
): Promise<Product | undefined> {
  return enqueue(async () => {
    const arr = await readJson<Product>(STORE_FILE);
    const idx = arr.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    const next = { ...arr[idx], ...patch, id };
    arr[idx] = next;
    await writeJson(STORE_FILE, arr);
    return next;
  });
}

export async function removeProduct(id: string): Promise<void> {
  return enqueue(async () => {
    const arr = await readJson<Product>(STORE_FILE);
    const target = arr.find((p) => p.id === id);
    if (target?.image?.startsWith("/uploads/")) {
      const filename = path.basename(target.image);
      await fs.rm(path.join(UPLOADS_DIR, filename), { force: true });
      // Legacy location: covers uploaded while files were written to public/.
      await fs.rm(path.join(process.cwd(), "public", "uploads", filename), { force: true });
    }
    await writeJson(STORE_FILE, arr.filter((p) => p.id !== id));
  });
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

// ---------- Orders ----------

export async function getAllOrders(): Promise<Order[]> {
  return readJson<Order>(ORDERS_FILE);
}

/**
 * Create an order from requested (productId, qty) pairs. Validates against
 * live products, decrements stock, and records the order — all inside the
 * write queue so stock can't go negative under concurrent checkouts.
 */
export async function createOrder(input: {
  asset: Order["asset"];
  assetLabel: string;
  items: { productId: string; qty: number }[];
}): Promise<{ order: Order } | { error: string }> {
  return enqueue(async () => {
    const products = await readJson<Product>(STORE_FILE);
    const lines: Order["lines"] = [];

    for (const { productId, qty } of input.items) {
      const product = products.find((p) => p.id === productId);
      if (!product) return { error: `Item no longer exists.` };
      if (qty < 1 || !Number.isInteger(qty)) return { error: "Invalid quantity." };
      if (product.stock < qty) {
        return {
          error: `Only ${product.stock} of "${product.title}" left in stock.`,
        };
      }
      lines.push({
        productId,
        title: product.title,
        game: product.game,
        unitPrice: product.price,
        qty,
      });
    }

    // All lines valid — decrement stock.
    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId)!;
      product.stock -= line.qty;
    }

    const order: Order = {
      id: `LH-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: "awaiting-payment",
      asset: input.asset,
      assetLabel: input.assetLabel,
      total: lines.reduce((s, l) => s + l.unitPrice * l.qty, 0),
      lines,
    };

    const orders = await readJson<Order>(ORDERS_FILE);
    await writeJson(STORE_FILE, products);
    await writeJson(ORDERS_FILE, [order, ...orders]);
    return { order };
  });
}

/** Add each order line's qty back onto (or off of) live product stock. */
async function adjustStockForOrder(order: Order, direction: 1 | -1): Promise<void> {
  const products = await readJson<Product>(STORE_FILE);
  let touched = false;
  for (const line of order.lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) continue; // product was deleted since — nothing to restore
    product.stock = Math.max(0, product.stock + direction * line.qty);
    touched = true;
  }
  if (touched) await writeJson(STORE_FILE, products);
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
): Promise<Order | undefined> {
  return enqueue(async () => {
    const orders = await readJson<Order>(ORDERS_FILE);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    const prev = orders[idx];
    if (prev.status === status) return prev;

    // Stock is held while an order is awaiting payment or fulfilled.
    // Cancelling releases it back to the store; reactivating re-holds it.
    if (status === "cancelled" && prev.status !== "cancelled") {
      await adjustStockForOrder(prev, 1);
    } else if (prev.status === "cancelled" && status !== "cancelled") {
      await adjustStockForOrder(prev, -1);
    }

    orders[idx] = { ...prev, status };
    await writeJson(ORDERS_FILE, orders);
    return orders[idx];
  });
}

export async function removeOrder(id: string): Promise<void> {
  return enqueue(async () => {
    const orders = await readJson<Order>(ORDERS_FILE);
    const target = orders.find((o) => o.id === id);
    // Deleting an unpaid order releases its held stock. Fulfilled orders
    // already delivered the items; cancelled orders already released stock.
    if (target?.status === "awaiting-payment") {
      await adjustStockForOrder(target, 1);
    }
    await writeJson(ORDERS_FILE, orders.filter((o) => o.id !== id));
  });
}
