import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Coins, MessagesSquare, Lock } from "lucide-react";
import { site, discord } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-border bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="LootHub logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-none border-2 border-primary object-contain"
            />
            <span className="font-display text-xs">LootHub</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{site.tagline}</p>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <MessagesSquare className="h-4 w-4 text-secondary" /> Discord delivery
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <Coins className="h-4 w-4 text-primary" /> Crypto checkout
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <ShieldCheck className="h-4 w-4 text-accent" /> Owner-run store
            </span>
          </div>
        </div>

        <FooterCol
          title="Marketplace"
          links={[
            { label: "Browse items", href: "/browse" },
            { label: "Shop", href: "/#shop" },
            { label: "Cart", href: "/cart" },
          ]}
        />
        <FooterCol
          title="Store"
          links={[
            { label: "How it works", href: "/#how" },
            { label: "Trust", href: "/#trust" },
            { label: "Crypto checkout", href: "/checkout" },
            { label: discord.serverName, href: discord.ticketUrl, external: true },
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            { label: "Browse all", href: "/browse" },
            { label: "Owner login", href: "/admin" },
            { label: site.email, href: `mailto:${site.email}` },
          ]}
        />
      </div>

      <div className="border-t-2 border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} LootHub &ndash; All rights reserved.
            <span className="mx-2 text-muted-foreground/50">|</span>
            Made with <span className="text-primary">&hearts;</span> for the Roblox &amp; Minecraft community.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Only the owner can list items · Crypto: USDT BEP20 &amp; LTC
          </p>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground/70">
            LootHub is not affiliated with, endorsed by, or sponsored by Roblox Corporation,
            Mojang, or Microsoft. All game names and trademarks are property of their
            respective owners. This is an independent seller of in-game items.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-[10px] uppercase tracking-wide text-foreground">{title}</h2>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-muted-foreground transition-colors hover:text-secondary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}