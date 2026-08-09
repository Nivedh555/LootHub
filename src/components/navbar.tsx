"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X, Lock, ShoppingBag, Search } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import { useCart } from "@/lib/cart-context";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setCompact(y > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  }

  const glass = scrolled || open;

  function isActive(href: string) {
    if (href.startsWith("/#")) return false;
    return pathname === href || (href !== "/" && pathname.startsWith(href.split("#")[0]));
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        glass ? "header-glass" : "header-clear",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center gap-4 px-4 transition-all duration-500 sm:px-6 lg:gap-6",
          compact ? "h-[3.75rem]" : "h-[4.5rem]",
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="LootHub home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={compact ? 36 : 44}
            height={compact ? 36 : 44}
            className={cn(
              "rounded-lg object-contain ring-1 ring-primary/30 transition-all duration-500",
              compact ? "h-9 w-9" : "h-11 w-11",
            )}
          />
          <span className="font-display text-lg font-bold tracking-wider text-foreground sm:text-xl">
            LOOTHUB
          </span>
        </Link>

        {/* Desktop search */}
        <form onSubmit={submit} className="group relative ml-2 hidden flex-1 max-w-sm md:block" role="search">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" aria-hidden />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="border-white/8 bg-white/4 pl-10 pr-10 text-sm backdrop-blur-md transition-all focus:border-primary/50 focus:bg-surface"
            aria-label="Search items"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground md:inline-block">
            /
          </kbd>
        </form>

        {/* Desktop nav */}
        <nav className="ml-auto hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {site.nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 font-display text-[13px] font-semibold tracking-wider transition-colors duration-200",
                  active ? "text-primary" : "text-foreground/60 hover:text-foreground",
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-px h-px rounded-full bg-primary"
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <CartButton />
          <Link
            href="/admin"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-muted-foreground/50 hover:text-primary")}
            aria-label="Owner login"
            title="Owner login"
          >
            <Lock className="h-4 w-4" aria-hidden />
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

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-3 px-4 py-5 sm:px-6">
              <MobileCartRow onClick={() => setOpen(false)} />
              <form onSubmit={submit} role="search" className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items" className="pl-10" aria-label="Search items" />
              </form>
              <nav className="grid gap-0.5" aria-label="Mobile">
                {site.nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 font-display text-sm font-semibold tracking-wider text-foreground/70 transition-colors hover:bg-surface hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="mt-1 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-surface hover:text-primary"
                >
                  <Lock className="h-3.5 w-3.5" /> Owner login
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function CartButton() {
  const { count } = useCart();
  const reduced = useReducedMotion();
  const prev = useRef(count);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (count !== prev.current) {
      prev.current = count;
      setPulse((p) => p + 1);
    }
  }, [count]);

  return (
    <Link
      href="/cart"
      className="group relative inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/20 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline font-display text-xs tracking-wider">CART</span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={pulse}
            initial={reduced ? false : { scale: 0.4 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

function MobileCartRow({ onClick }: { onClick: () => void }) {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      onClick={onClick}
      className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
    >
      <span className="inline-flex items-center gap-2">
        <ShoppingBag className="h-4 w-4" aria-hidden />
        Cart
      </span>
      {count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
          {count}
        </span>
      )}
    </Link>
  );
}
