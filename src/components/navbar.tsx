"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search, ShoppingBag, X, Lock } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="LootHub home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-lg object-contain ring-1 ring-primary/40"
            preload
          />
          <span className="font-display text-lg tracking-wide">LootHub</span>
        </Link>

        <form onSubmit={submit} className="relative ml-2 hidden flex-1 md:block" role="search">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, pets, knives, gear…"
            className="pl-10"
            aria-label="Search items"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
          {site.nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href.split("#")[0]));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Link
            href="/admin"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-muted-foreground hover:text-primary")}
            aria-label="Owner login"
            title="Owner login"
          >
            <Lock className="h-5 w-5" aria-hidden />
          </Link>
          <Link
            href="/cart"
            className={cn(buttonVariants({ variant: "outline", size: "icon" }), "relative")}
            aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground ring-2 ring-background">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 sm:px-6">
            <form onSubmit={submit} role="search" className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search items"
                className="pl-10"
                aria-label="Search items"
              />
            </form>
            <nav className="grid gap-1" aria-label="Mobile">
              {site.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-primary"
              >
                <Lock className="h-4 w-4" /> Owner login
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}