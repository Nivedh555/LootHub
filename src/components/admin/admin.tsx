"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  Sparkles,
  KeyRound,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getAdminPasscode, lockAdmin, tryUnlock, useAdminUnlocked } from "@/lib/admin-auth";
import { games } from "@/config/games";
import { adminIsCustom } from "@/config/admin";
import { cn } from "@/lib/utils";
import type { Game, Product } from "@/lib/types";

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

export function Admin({ initialUploaded }: { initialUploaded: Product[] }) {
  const unlocked = useAdminUnlocked();
  if (!unlocked) return <Gate />;
  return <Dashboard initialUploaded={initialUploaded} />;
}

function Gate() {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!tryUnlock(pass)) {
      setError("Wrong passcode. Only the store owner can list items.");
    } else {
      setError("");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Lock className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl">Owner dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is for the store owner only. Buyers cannot upload items. Enter the
          passcode to list a new product.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
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
        <Button type="submit" size="lg" className="w-full justify-center">
          <ShieldCheck className="h-5 w-5" /> Unlock dashboard
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {!adminIsCustom
            ? "Demo passcode is the default. Set NEXT_PUBLIC_ADMIN_PASSCODE to change it."
            : "Passcode loaded from your environment."}
        </p>
      </form>

      <Link href="/browse" className={cn(buttonVariants({ variant: "ghost" }), "justify-center")}>
        <ArrowRight className="h-4 w-4" /> Back to store
      </Link>
    </div>
  );
}

function Dashboard({ initialUploaded }: { initialUploaded: Product[] }) {
  const [list, setList] = useState<Product[]>(initialUploaded);
  const [form, setForm] = useState({ ...empty });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    update("image", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(typeof reader.result === "string" ? reader.result : null);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  const draft = useMemo<Product>(
    () => ({
      id: "draft-preview",
      title: form.title || "Untitled listing",
      game: form.game,
      price: Number(form.price) || 0,
      rarity: form.rarity.trim() || undefined,
      stock: Math.max(0, Number(form.stock) || 0),
      description: form.description || "Your item description will appear here.",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverSeed: form.title || "loothub",
      image: imagePreview ?? undefined,
      featured: false,
      local: true,
    }),
    [form, imagePreview],
  );

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    const passcode = getAdminPasscode();
    if (!passcode) {
      setServerError("Session expired. Lock and unlock again.");
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("passcode", passcode);
      data.append("title", form.title.trim());
      data.append("game", form.game);
      data.append("price", form.price);
      data.append("rarity", form.rarity.trim());
      data.append("stock", form.stock);
      data.append("description", form.description.trim());
      data.append("tags", form.tags.trim());
      if (form.image) data.append("image", form.image);

      const res = await fetch("/api/products", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json?.error ?? "Upload failed.");
        return;
      }
      const product = json.product as Product;
      setList((prev) => [product, ...prev]);
      setCreated(product);
      setForm({ ...empty });
      setImagePreview(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Network error while uploading.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeOne(id: string) {
    const passcode = getAdminPasscode();
    if (!passcode) {
      setServerError("Session expired. Lock and unlock again.");
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}?passcode=${encodeURIComponent(passcode)}`, {
        method: "DELETE",
      });
      if (res.ok) setList((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Owner dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Items you publish here are saved on the server and appear on the public
            storefront immediately. Buyers cannot upload.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => lockAdmin()}>
          <LogOut className="h-4 w-4" /> Lock
        </Button>
      </div>

      {serverError && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5" /> {serverError}
        </div>
      )}

      {created && (
        <div className="mb-8 flex flex-col items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display">Item published to the store</p>
              <p className="text-sm text-muted-foreground">
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

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg">Item details</h2>
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

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg">Cover image</h2>
            {imagePreview ? (
              <div className="flex items-center gap-4">
                <Image
                  src={imagePreview}
                  alt="Cover preview"
                  width={112}
                  height={112}
                  unoptimized
                  className="h-28 w-28 rounded-xl border border-border object-cover"
                />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cover uploaded. Buyers see this image on your item card.
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
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-primary/60"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Upload className="h-6 w-6" />
                </span>
                <span className="font-medium">Click to upload a cover image</span>
                <span className="text-xs text-muted-foreground">
                  PNG or JPG. Saved to the server at <code>/uploads/</code>.
                </span>
                <input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="sr-only"
                />
              </label>
            )}
            {!imagePreview && (
              <p className="mt-2 text-xs text-muted-foreground">
                No image? We generate a vibrant cover from your title instead.
              </p>
            )}
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full justify-center sm:w-auto">
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Publishing…</>
            ) : (
              <><PackageCheck className="h-5 w-5" /> Publish item</>
            )}
          </Button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Live preview
          </p>
          <ProductCard product={draft} />
        </aside>
      </div>

      <section className="mt-16">
        <h2 className="mb-4 font-display text-2xl">Your listings ({list.length})</h2>
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No items published yet. Upload your first product above.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            {list.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.game} · {p.rarity ?? "—"} · ${p.price.toFixed(2)} · {p.stock} in stock
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