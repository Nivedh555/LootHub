import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db, hasDb } from "./db";
import type { Order, Product, GameAccount } from "./types";

/**
 * Storage layer. With DATABASE_URL set (production / Vercel) everything
 * lives in Postgres — products, orders, and uploaded cover images.
 * Without it (local dev) the original JSON-file store under data/ is used.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// Local-dev uploads dir. In production uploads are stored in Postgres.
export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

/**
 * Serialize all read-modify-write cycles through one promise chain so
 * concurrent requests can't clobber each other's writes (file store only —
 * Postgres uses transactions instead).
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
  if (hasDb) {
    const pool = await db();
    const res = await pool.query("SELECT data FROM products ORDER BY pos DESC");
    return res.rows.map((r) => r.data as Product);
  }
  return readJson<Product>(STORE_FILE);
}

export async function findProductById(id: string): Promise<Product | undefined> {
  if (hasDb) {
    const pool = await db();
    const res = await pool.query("SELECT data FROM products WHERE id = $1", [id]);
    return (res.rows[0]?.data as Product) ?? undefined;
  }
  return (await readJson<Product>(STORE_FILE)).find((p) => p.id === id);
}

export async function addProduct(input: Product): Promise<Product> {
  if (hasDb) {
    const pool = await db();
    await pool.query("INSERT INTO products (id, data) VALUES ($1, $2)", [
      input.id,
      JSON.stringify(input),
    ]);
    return input;
  }
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
  if (hasDb) {
    const pool = await db();
    const res = await pool.query(
      "UPDATE products SET data = data || $2::jsonb WHERE id = $1 RETURNING data",
      [id, JSON.stringify({ ...patch, id })],
    );
    return (res.rows[0]?.data as Product) ?? undefined;
  }
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

/** Remove a product. Returns true if the product existed and was deleted. */
export async function removeProduct(id: string): Promise<boolean> {
  if (hasDb) {
    const pool = await db();
    const res = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING data",
      [id],
    );
    const image = (res.rows[0]?.data as Product | undefined)?.image;
    if (image?.startsWith("/uploads/")) {
      await pool.query("DELETE FROM uploads WHERE filename = $1", [
        path.basename(image),
      ]);
    }
    return res.rowCount !== null && res.rowCount > 0;
  }
  return enqueue(async () => {
    const arr = await readJson<Product>(STORE_FILE);
    const target = arr.find((p) => p.id === id);
    if (!target) return false;
    if (target?.image?.startsWith("/uploads/")) {
      const filename = path.basename(target.image);
      await fs.rm(path.join(UPLOADS_DIR, filename), { force: true });
      // Legacy location: covers uploaded while files were written to public/.
      await fs.rm(path.join(process.cwd(), "public", "uploads", filename), { force: true });
    }
    await writeJson(STORE_FILE, arr.filter((p) => p.id !== id));
    return true;
  });
}

// ---------- Uploaded cover images ----------

// Raster formats only — must stay in sync with the MIME allow-list in
// src/app/uploads/[file]/route.ts. SVG excluded (script-capable).
const ALLOWED_IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif"]);

const EXT_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};

/** Validate image file by magic bytes (PNG, JPEG, GIF, WebP, AVIF). */
export function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return true;
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;
  const ftyp = buffer.indexOf("ftyp");
  if (ftyp !== -1 && buffer.slice(ftyp, ftyp + 16).toString().includes("avif")) return true;
  return false;
}

export async function saveUploadedImage(id: string, file: File): Promise<string> {
  const rawExt = (file.name.split(".").pop() ?? "png").toLowerCase();
  const ext = ALLOWED_IMAGE_EXTS.has(rawExt) ? rawExt : "png";
  const filename = `${id}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Server-side magic-byte validation (defence in depth).
  if (!isValidImageMagicBytes(buffer)) {
    throw new Error("Invalid image file: bad magic bytes.");
  }

  if (hasDb) {
    const pool = await db();
    await pool.query(
      `INSERT INTO uploads (filename, content_type, bytes) VALUES ($1, $2, $3)
       ON CONFLICT (filename) DO UPDATE SET content_type = $2, bytes = $3`,
      [filename, EXT_MIME[ext], buffer],
    );
  } else {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
  }
  return `/uploads/${filename}`;
}

/** Read an uploaded cover for serving. Returns undefined when missing. */
export async function getUploadedImage(
  filename: string,
): Promise<{ bytes: Buffer; contentType: string } | undefined> {
  if (hasDb) {
    const pool = await db();
    const res = await pool.query(
      "SELECT content_type, bytes FROM uploads WHERE filename = $1",
      [filename],
    );
    const row = res.rows[0];
    if (!row) return undefined;
    return { bytes: row.bytes as Buffer, contentType: row.content_type as string };
  }
  const ext = filename.split(".").pop()!.toLowerCase();
  const contentType = EXT_MIME[ext];
  if (!contentType) return undefined;
  const candidates = [
    path.join(UPLOADS_DIR, filename),
    // Legacy location: covers uploaded while files were written to public/.
    path.join(process.cwd(), "public", "uploads", filename),
  ];
  for (const filePath of candidates) {
    try {
      return { bytes: await fs.readFile(filePath), contentType };
    } catch {
      // try next candidate
    }
  }
  return undefined;
}

// ---------- Orders ----------

export async function getAllOrders(): Promise<Order[]> {
  if (hasDb) {
    const pool = await db();
    const res = await pool.query("SELECT data FROM orders ORDER BY pos DESC");
    return res.rows.map((r) => r.data as Order);
  }
  return readJson<Order>(ORDERS_FILE);
}

function buildOrder(lines: Order["lines"], input: {
  asset: Order["asset"];
  assetLabel: string;
}): Order {
  return {
    id: `LH-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "awaiting-payment",
    asset: input.asset,
    assetLabel: input.assetLabel,
    total: lines.reduce((s, l) => s + l.unitPrice * l.qty, 0),
    lines,
  };
}

/**
 * Create an order from requested (productId, qty) pairs. Validates against
 * live products, decrements stock, and records the order — atomically.
 * File store: via the write queue. Postgres: via a transaction with row
 * locks so stock can't go negative under concurrent checkouts.
 */
export async function createOrder(input: {
  asset: Order["asset"];
  assetLabel: string;
  items: { productId: string; qty: number }[];
}): Promise<{ order: Order } | { error: string }> {
  if (hasDb) {
    const pool = await db();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const lines: Order["lines"] = [];
      for (const { productId, qty } of input.items) {
        if (qty < 1 || !Number.isInteger(qty)) {
          await client.query("ROLLBACK");
          return { error: "Invalid quantity." };
        }
        const res = await client.query(
          "SELECT data FROM products WHERE id = $1 FOR UPDATE",
          [productId],
        );
        const product = res.rows[0]?.data as Product | undefined;
        if (!product) {
          await client.query("ROLLBACK");
          return { error: "Item no longer exists." };
        }
        if (product.stock < qty) {
          await client.query("ROLLBACK");
          return { error: `Only ${product.stock} of "${product.title}" left in stock.` };
        }
        await client.query(
          "UPDATE products SET data = jsonb_set(data, '{stock}', to_jsonb($2::int)) WHERE id = $1",
          [productId, product.stock - qty],
        );
        lines.push({
          productId,
          title: product.title,
          game: product.game,
          unitPrice: product.price,
          qty,
        });
      }
      const order = buildOrder(lines, input);
      await client.query("INSERT INTO orders (id, data) VALUES ($1, $2)", [
        order.id,
        JSON.stringify(order),
      ]);
      await client.query("COMMIT");
      return { order };
    } catch (err) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

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

    const order = buildOrder(lines, input);
    const orders = await readJson<Order>(ORDERS_FILE);
    await writeJson(STORE_FILE, products);
    await writeJson(ORDERS_FILE, [order, ...orders]);
    return { order };
  });
}

/** Add each order line's qty back onto (or off of) live product stock. */
async function adjustStockForOrder(order: Order, direction: 1 | -1): Promise<void> {
  if (hasDb) {
    const pool = await db();
    for (const line of order.lines) {
      await pool.query(
        `UPDATE products
         SET data = jsonb_set(data, '{stock}',
           to_jsonb(GREATEST(0, (data->>'stock')::int + $2::int)))
         WHERE id = $1`,
        [line.productId, direction * line.qty],
      );
    }
    return;
  }
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
  if (hasDb) {
    const pool = await db();
    const res = await pool.query("SELECT data FROM orders WHERE id = $1", [id]);
    const prev = res.rows[0]?.data as Order | undefined;
    if (!prev) return undefined;
    if (prev.status === status) return prev;

    // Stock is held while an order is awaiting payment or fulfilled.
    // Cancelling releases it back to the store; reactivating re-holds it.
    if (status === "cancelled" && prev.status !== "cancelled") {
      await adjustStockForOrder(prev, 1);
    } else if (prev.status === "cancelled" && status !== "cancelled") {
      await adjustStockForOrder(prev, -1);
    }

    const next = { ...prev, status };
    await pool.query("UPDATE orders SET data = $2 WHERE id = $1", [
      id,
      JSON.stringify(next),
    ]);
    return next;
  }

  return enqueue(async () => {
    const orders = await readJson<Order>(ORDERS_FILE);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    const prev = orders[idx];
    if (prev.status === status) return prev;

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
  if (hasDb) {
    const pool = await db();
    const res = await pool.query(
      "DELETE FROM orders WHERE id = $1 RETURNING data",
      [id],
    );
    const target = res.rows[0]?.data as Order | undefined;
    // Deleting an unpaid order releases its held stock. Fulfilled orders
    // already delivered the items; cancelled orders already released stock.
    if (target?.status === "awaiting-payment") {
      await adjustStockForOrder(target, 1);
    }
    return;
  }

  return enqueue(async () => {
    const orders = await readJson<Order>(ORDERS_FILE);
    const target = orders.find((o) => o.id === id);
    if (target?.status === "awaiting-payment") {
      await adjustStockForOrder(target, 1);
    }
    await writeJson(ORDERS_FILE, orders.filter((o) => o.id !== id));
  });
}

// ---------- Game Accounts ----------

const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");

export async function getAllAccounts(): Promise<GameAccount[]> {
  if (hasDb) {
    const pool = await db();
    const res = await pool.query("SELECT data FROM game_accounts ORDER BY pos DESC");
    return res.rows.map((r) => r.data as GameAccount);
  }
  return readJson<GameAccount>(ACCOUNTS_FILE);
}

export async function findAccountById(id: string): Promise<GameAccount | undefined> {
  if (hasDb) {
    const pool = await db();
    const res = await pool.query("SELECT data FROM game_accounts WHERE id = $1", [id]);
    return (res.rows[0]?.data as GameAccount) ?? undefined;
  }
  return (await readJson<GameAccount>(ACCOUNTS_FILE)).find((a) => a.id === id);
}

export async function addAccount(input: GameAccount): Promise<GameAccount> {
  if (hasDb) {
    const pool = await db();
    await pool.query("INSERT INTO game_accounts (id, data) VALUES ($1, $2)", [
      input.id,
      JSON.stringify(input),
    ]);
    return input;
  }
  return enqueue(async () => {
    const arr = await readJson<GameAccount>(ACCOUNTS_FILE);
    await writeJson(ACCOUNTS_FILE, [input, ...arr]);
    return input;
  });
}

export async function updateAccount(
  id: string,
  patch: Partial<GameAccount>,
): Promise<GameAccount | undefined> {
  if (hasDb) {
    const pool = await db();
    const res = await pool.query(
      "UPDATE game_accounts SET data = data || $2::jsonb WHERE id = $1 RETURNING data",
      [id, JSON.stringify({ ...patch, id })],
    );
    return (res.rows[0]?.data as GameAccount) ?? undefined;
  }
  return enqueue(async () => {
    const arr = await readJson<GameAccount>(ACCOUNTS_FILE);
    const idx = arr.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    const next = { ...arr[idx], ...patch, id };
    arr[idx] = next;
    await writeJson(ACCOUNTS_FILE, arr);
    return next;
  });
}

export async function removeAccount(id: string): Promise<boolean> {
  if (hasDb) {
    const pool = await db();
    const res = await pool.query(
      "DELETE FROM game_accounts WHERE id = $1 RETURNING data",
      [id],
    );
    const image = (res.rows[0]?.data as GameAccount | undefined)?.image;
    if (image?.startsWith("/uploads/")) {
      await pool.query("DELETE FROM uploads WHERE filename = $1", [
        path.basename(image),
      ]);
    }
    return res.rowCount !== null && res.rowCount > 0;
  }
  return enqueue(async () => {
    const arr = await readJson<GameAccount>(ACCOUNTS_FILE);
    const target = arr.find((a) => a.id === id);
    if (!target) return false;
    if (target?.image?.startsWith("/uploads/")) {
      const filename = path.basename(target.image);
      await fs.rm(path.join(UPLOADS_DIR, filename), { force: true });
      await fs.rm(path.join(process.cwd(), "public", "uploads", filename), { force: true });
    }
    await writeJson(ACCOUNTS_FILE, arr.filter((a) => a.id !== id));
    return true;
  });
}
