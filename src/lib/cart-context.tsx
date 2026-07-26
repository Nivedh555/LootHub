"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { Product } from "./types";

export interface CartItem {
  product: Product;
  qty: number;
}

const KEY = "loothub:cart";
const EMPTY: CartItem[] = [];
let cache: CartItem[] = EMPTY;
let snapshot: CartItem[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}
function commit(next: CartItem[]) {
  cache = next;
  snapshot = next;
  persist();
  emit();
}

export function hydrateCart() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (i) => i && i.product && typeof i.product.game === "string" && typeof i.product.price === "number",
        );
        commit(valid);
      }
    }
  } catch {
    // ignore malformed storage
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function getSnapshot() {
  return snapshot;
}

export function addProduct(product: Product, qty = 1) {
  const max = Math.max(0, product.stock);
  if (max === 0) return false;
  const existing = cache.find((i) => i.product.id === product.id);
  const current = existing?.qty ?? 0;
  if (current >= max) return false;
  const nextQty = Math.min(current + qty, max);
  commit(
    existing
      ? // Refresh the stored product snapshot too, so stock limits stay current.
        cache.map((i) => (i.product.id === product.id ? { product, qty: nextQty } : i))
      : [...cache, { product, qty: nextQty }],
  );
  return true;
}
export function removeProduct(id: string) {
  commit(cache.filter((i) => i.product.id !== id));
}
export function setProductQty(id: string, qty: number) {
  if (qty <= 0) {
    commit(cache.filter((i) => i.product.id !== id));
    return;
  }
  commit(
    cache.map((i) =>
      i.product.id === id ? { ...i, qty: Math.min(qty, Math.max(1, i.product.stock)) } : i,
    ),
  );
}
export function clearCart() {
  commit(EMPTY);
}

/**
 * Reconcile cart snapshots against the live catalog: refresh product data
 * (price/stock/title), drop listings the owner deleted, and clamp quantities
 * to current stock. Returns true when anything changed.
 */
export async function syncCartWithCatalog(): Promise<boolean> {
  if (cache.length === 0) return false;
  let products: Product[];
  try {
    const res = await fetch("/api/products", { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { products?: Product[] };
    if (!Array.isArray(data.products)) return false;
    products = data.products;
  } catch {
    return false; // offline — keep the cart as-is
  }

  let changed = false;
  const next: CartItem[] = [];
  for (const item of cache) {
    const live = products.find((p) => p.id === item.product.id);
    if (!live || live.stock <= 0) {
      changed = true; // removed from store or sold out
      continue;
    }
    const qty = Math.min(item.qty, live.stock);
    if (qty !== item.qty || JSON.stringify(live) !== JSON.stringify(item.product)) {
      changed = true;
    }
    next.push({ product: live, qty });
  }
  if (changed) commit(next);
  return changed;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateCart();
  }, []);
  return <>{children}</>;
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.product.price, 0),
      add: addProduct,
      remove: removeProduct,
      setQty: setProductQty,
      clear: clearCart,
      sync: syncCartWithCatalog,
    }),
    [items],
  );
}