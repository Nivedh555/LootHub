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
  const existing = cache.find((i) => i.product.id === product.id);
  commit(
    existing
      ? cache.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + qty } : i))
      : [...cache, { product, qty }],
  );
}
export function removeProduct(id: string) {
  commit(cache.filter((i) => i.product.id !== id));
}
export function setProductQty(id: string, qty: number) {
  if (qty <= 0) {
    commit(cache.filter((i) => i.product.id !== id));
    return;
  }
  commit(cache.map((i) => (i.product.id === id ? { ...i, qty } : i)));
}
export function clearCart() {
  commit(EMPTY);
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
    }),
    [items],
  );
}