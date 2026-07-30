"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Lock,
  Upload,
  Trash2,
  Check,
  ArrowRight,
  PackageCheck,
  X,
  Eye,
  LogOut,
  ShieldCheck,
  KeyRound,
  Loader2,
  AlertCircle,
  ClipboardList,
  Coins,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { compressImage } from "@/lib/compress-image";
import { formatPrice } from "@/lib/format";
import { games } from "@/config/games";
import { cn } from "@/lib/utils";
import type { Game, Order, OrderStatus, Product } from "@/lib/types";

const empty = {
  title: "",
  game: "Adopt Me!" as Game,
  price: "",
  rarity: "",
  stock: "1",
  description: "",
  tags: "",
  image: null as File | null,
};

export function Admin({
  authed,
  initialProducts,
  initialOrders,
}: {
  authed: boolean;
  initialProducts: Product[];
  initialOrders: Order[];
}) {
  if (!authed) return <Gate />;
  return <Dashboard initialProducts={initialProducts} initialOrders={initialOrders} />;
}

function Gate() {
  const router = useRouter();
  const toast = useToast();
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: pass }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message = json?.error ?? "Wrong passcode. Only the store owner can sign in.";
        setError(message);
        toast.error(message);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      toast.error("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-none border-2 border-primary bg-surface text-primary pixel-shadow-dark">
          <Lock className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-lg text-pixel sm:text-xl">Owner dashboard</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This area is for the store owner only. Enter the passcode to manage
          listings and orders.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-none border-2 border-border bg-card p-6 pixel-shadow-dark">
        <div>
          <Label htmlFor="pass" className="mb-2 block">
            Owner passcode
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Enter passcode"
              className="pl-9"
              autoFocus
            />
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" size="lg" disabled={busy} className="w-full justify-center">
          {busy ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</>
          ) : (
            <><ShieldCheck className="h-5 w-5" /> Unlock dashboard</>
          )}
        </Button>
      </form>

      <Link href="/browse" className={cn(buttonVariants({ variant: "ghost" }), "justify-center")}>
        <ArrowRight className="h-4 w-4" /> Back to store
      </Link>
    </div>
  );
}

function Dashboard({
  initialProducts,
  initialOrders,
}: {
  initialProducts: Product[];
  initialOrders: Order[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [list, setList] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [form, setForm] = useState({ ...empty });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [refreshingOrders, setRefreshingOrders] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /**
   * Shrink the cover in the browser before it ever hits the network, so a
   * full-resolution phone photo still publishes (serverless bodies cap ~4.5 MB).
   */
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = ""; // allow re-picking the same file after a failure
    if (!picked) {
      update("image", null);
      setImagePreview(null);
      return;
    }

    setCompressing(true);
    let file = picked;
    try {
      file = await compressImage(picked);
    } catch (err) {
      setCompressing(false);
      toast.error(err instanceof Error ? err.message : "Could not process that image.");
      return;
    }

    update("image", file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(typeof reader.result === "string" ? reader.result : null);
      setCompressing(false);
    };
    reader.onerror = () => {
      setCompressing(false);
      toast.error("Could not preview that image, but it will still upload.");
    };
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Add an item title.";
    if (!form.description.trim()) next.description = "Add a description.";
    const priceNum = Number(form.price);
    if (!form.price || Number.isNaN(priceNum) || priceNum < 0.5) {
      next.price = "Set a price of at least $0.50.";
    }
    const stockNum = Number(form.stock);
    if (!form.stock || Number.isNaN(stockNum) || stockNum < 1) {
      next.stock = "Stock must be at least 1.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleAuthFailure(res: Response): Promise<boolean> {
    if (res.status === 401) {
      setServerError("Session expired. Sign in again.");
      toast.error("Session expired. Sign in again.");
      router.refresh();
      return true;
    }
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("game", form.game);
      data.append("price", form.price);
      data.append("rarity", form.rarity.trim());
      data.append("stock", form.stock);
      data.append("description", form.description.trim());
      data.append("tags", form.tags.trim());
      if (form.image) data.append("image", form.image);

      const res = await fetch("/api/products", { method: "POST", body: data });
      if (await handleAuthFailure(res)) return;
      const json = await res.json();
      if (!res.ok) {
        const message = json?.error ?? "Upload failed.";
        setServerError(message);
        toast.error(message);
        return;
      }
      const product = json.product as Product;
      setList((prev) => [product, ...prev]);
      setCreated(product);
      setForm({ ...empty });
      setImagePreview(null);
      toast.success(`"${product.title}" is live on the store.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Network error while uploading.");
      toast.error("Network error while uploading.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeOne(id: string) {
    setServerError(null);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (await handleAuthFailure(res)) return;
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        toast.error(json?.error ?? "Could not remove that item.");
        return;
      }
      setList((prev) => prev.filter((p) => p.id !== id));
      toast.success("Item removed from the store.");
    } catch {
      setServerError("Network error while deleting.");
      toast.error("Network error while deleting.");
    }
  }

  const refreshOrders = useCallback(async () => {
    setRefreshingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const json = await res.json();
        setOrders(json.orders as Order[]);
      }
    } catch {
      // Keep the current list — the 30s poll will try again.
    } finally {
      setRefreshingOrders(false);
    }
  }, []);

  // Refresh product stock alongside orders (checkout decrements stock).
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const json = await res.json();
        setList(json.products as Product[]);
      }
    } catch {
      // keep current list
    }
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      refreshOrders();
      refreshProducts();
    }, 30_000);
    return () => window.clearInterval(t);
  }, [refreshOrders, refreshProducts]);

  async function setOrderStatus(id: string, status: OrderStatus) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (await handleAuthFailure(res)) return;
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        toast.error(json?.error ?? "Could not update that order.");
        return;
      }
      const json = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? (json.order as Order) : o)));
      toast.success(status === "fulfilled" ? "Order marked fulfilled." : "Order cancelled.");
    } catch {
      toast.error("Network error while updating the order.");
    }
  }

  async function deleteOrder(id: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (await handleAuthFailure(res)) return;
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        toast.error(json?.error ?? "Could not delete that order.");
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Order deleted.");
    } catch {
      toast.error("Network error while deleting the order.");
    }
  }

  async function signOut() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.refresh();
    }
  }

  const awaiting = useMemo(
    () => orders.filter((o) => o.status === "awaiting-payment").length,
    [orders],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl text-pixel sm:text-2xl">Owner dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Items you publish here appear on the public storefront immediately.
            Orders show up below as buyers check out.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2 rounded-none border-2 border-destructive bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle className="h-5 w-5 shrink-0" /> {serverError}
        </div>
      )}

      {created && (
        <div className="mb-8 flex flex-col items-start gap-4 rounded-none border-2 border-success bg-success/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border-2 border-success bg-success text-success-foreground">
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-[11px] uppercase leading-relaxed text-success">
                Item published
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                &ldquo;{created.title}&rdquo; is now live in the marketplace.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/product/${created.id}`} className={buttonVariants({ variant: "primary", size: "sm" })}>
              <Eye className="h-4 w-4" /> View
            </Link>
            <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
              On storefront <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Orders */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="inline-flex flex-wrap items-center gap-3 font-display text-base leading-relaxed sm:text-lg">
            <ClipboardList className="h-6 w-6 text-secondary" aria-hidden /> Orders
            {awaiting > 0 && (
              <span className="rounded-none border-2 border-success bg-success px-2 py-1 font-display text-[9px] uppercase text-success-foreground">
                {awaiting} awaiting payment
              </span>
            )}
          </h2>
          <Button variant="outline" size="sm" onClick={refreshOrders} disabled={refreshingOrders}>
            <RefreshCw className={cn("h-4 w-4", refreshingOrders && "animate-spin")} /> Refresh
          </Button>
        </div>

        {orders.length === 0 ? (
          <p className="rounded-none border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No orders yet. When a buyer checks out, their order appears here with
            an ID they&apos;ll paste in your Discord ticket.
          </p>
        ) : (
          <div className="rounded-none border-2 border-border bg-card">
            {orders.map((o) => (
              <div key={o.id} className="border-b-2 border-border p-4 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <code className="rounded-none border-2 border-border bg-surface px-2 py-1 font-display text-[10px] text-secondary">
                      {o.id}
                    </code>
                    <StatusBadge status={o.status} />
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Coins className="h-4 w-4 text-accent" aria-hidden /> {o.assetLabel}
                    </span>
                    <span className="font-display text-[11px] text-accent">{formatPrice(o.total)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.status !== "fulfilled" && (
                      <Button size="sm" variant="success" onClick={() => setOrderStatus(o.id, "fulfilled")}>
                        <Check className="h-4 w-4" /> Fulfilled
                      </Button>
                    )}
                    {o.status === "awaiting-payment" && (
                      <Button size="sm" variant="outline" onClick={() => setOrderStatus(o.id, "cancelled")}>
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteOrder(o.id)}
                      aria-label={`Delete order ${o.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                  {o.lines.map((l) => (
                    <li key={`${o.id}-${l.productId}`}>
                      {l.qty} × {l.title}{" "}
                      <span className="text-xs">({l.game} · {formatPrice(l.unitPrice)} each)</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New listing form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="rounded-none border-2 border-border bg-card p-6">
          <h2 className="mb-6 font-display text-sm leading-relaxed">List a new item</h2>
          <div className="grid gap-5">
            <Field label="Item title" htmlFor="title" error={errors.title}>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Neon Fly Ride Frost Dragon"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Game" htmlFor="game">
                <Select id="game" value={form.game} onChange={(e) => update("game", e.target.value as Game)}>
                  {games.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Rarity (optional)" htmlFor="rarity">
                <Input
                  id="rarity"
                  value={form.rarity}
                  onChange={(e) => update("rarity", e.target.value)}
                  placeholder="Legendary, Godly, Mega Neon…"
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Price (USD)" htmlFor="price" error={errors.price}>
                <Input
                  id="price"
                  type="number"
                  min={0.5}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="29.99"
                />
              </Field>
              <Field label="Stock (qty)" htmlFor="stock" error={errors.stock}>
                <Input
                  id="stock"
                  type="number"
                  min={1}
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  placeholder="1"
                />
              </Field>
            </div>

            <Field label="Description" htmlFor="description" error={errors.description}>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the item, whether it's tradeable, and any relevant details."
                rows={4}
              />
            </Field>

            <Field label="Tags (comma separated, optional)" htmlFor="tags">
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                placeholder="neon, fly, ride, legendary"
              />
            </Field>
          </div>
        </div>

        <div className="rounded-none border-2 border-border bg-card p-6">
          <h2 className="mb-6 font-display text-sm leading-relaxed">Cover image (optional)</h2>
          {imagePreview ? (
            <div className="flex items-center gap-4">
              <Image
                src={imagePreview}
                alt="Cover preview"
                width={112}
                height={112}
                unoptimized
                className="h-28 w-28 rounded-none border-2 border-border object-cover"
              />
              <div>
                <p className="text-sm text-muted-foreground">
                  Cover ready. Buyers see this image on your item card.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-destructive"
                  onClick={() => { update("image", null); setImagePreview(null); }}
                >
                  <X className="h-4 w-4" /> Remove image
                </Button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="cover"
              aria-busy={compressing}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-none border-2 border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-primary",
                compressing && "pointer-events-none opacity-70",
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-none border-2 border-primary bg-background text-primary">
                {compressing ? (
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                ) : (
                  <Upload className="h-6 w-6" aria-hidden />
                )}
              </span>
              <span className="font-display text-[10px] uppercase leading-relaxed">
                {compressing ? "Compressing…" : "Click to upload a cover"}
              </span>
              <span className="text-xs text-muted-foreground">
                Any size photo — compressed automatically. Without one, a cover is
                generated from the title.
              </span>
              <input
                id="cover"
                type="file"
                accept="image/*"
                onChange={onFile}
                disabled={compressing}
                className="sr-only"
              />
            </label>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting || compressing}
          className="w-full justify-center sm:w-auto"
        >
          {submitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Publishing…</>
          ) : (
            <><PackageCheck className="h-5 w-5" /> Publish item</>
          )}
        </Button>
      </form>

      {/* Listings */}
      <section className="mt-16">
        <h2 className="mb-4 font-display text-base leading-relaxed sm:text-lg">
          Your listings ({list.length})
        </h2>
        {list.length === 0 ? (
          <p className="rounded-none border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No items published yet. Upload your first product above.
          </p>
        ) : (
          <div className="rounded-none border-2 border-border bg-card">
            {list.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 border-b-2 border-border p-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.game} · {p.rarity ?? "—"} ·{" "}
                    <span className="font-display text-[9px] text-accent">{formatPrice(p.price)}</span> ·{" "}
                    <span className={cn(p.stock === 0 && "font-semibold text-destructive")}>
                      {p.stock} in stock
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/product/${p.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    <Eye className="h-4 w-4" /> View
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeOne(p.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string }> = {
    "awaiting-payment": {
      label: "Awaiting payment",
      cls: "border-secondary bg-secondary/10 text-secondary",
    },
    fulfilled: { label: "Fulfilled", cls: "border-success bg-success/10 text-success" },
    cancelled: {
      label: "Cancelled",
      cls: "border-destructive bg-destructive/10 text-destructive",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border-2 px-2 py-1 font-display text-[9px] uppercase",
        cls,
      )}
    >
      {label}
    </span>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-2 block">
        {label}
      </Label>
      {children}
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
