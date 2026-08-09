import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Coins, MessagesSquare, Lock } from "lucide-react";
import { site, discord } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="LootHub logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain ring-1 ring-primary/30"
            />
            <span className="font-display text-base font-bold tracking-wider">LOOTHUB</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{site.tagline}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <MessagesSquare className="h-3.5 w-3.5 text-[#7289da]/60" />
              Discord delivery
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Coins className="h-3.5 w-3.5 text-primary/60" />
              Crypto checkout
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <ShieldCheck className="h-3.5 w-3.5 text-accent/60" />
              Owner-run
            </span>
          </div>
        </div>

        <FooterCol
          title="Marketplace"
          links={[
            { label: "Browse items", href: "/browse" },
            { label: "Game accounts", href: "/accounts" },
            { label: "Cart", href: "/cart" },
          ]}
        />
        <FooterCol
          title="Store"
          links={[
            { label: "How it works", href: "/#how" },
            { label: "Why LootHub", href: "/#trust" },
            { label: "Crypto checkout", href: "/checkout" },
            { label: discord.serverName, href: discord.ticketUrl, external: true },
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            { label: "Browse all", href: "/browse" },
            { label: "FAQ", href: "/#faq" },
            { label: "Owner login", href: "/admin" },
            { label: site.email, href: `mailto:${site.email}` },
          ]}
        />
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground/50 sm:flex-row sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} LootHub &ndash; All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Owner-only listings · USDT BEP20 &amp; LTC
          </p>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <p className="text-center text-[10px] leading-relaxed text-muted-foreground/30">
            LootHub is not affiliated with, endorsed by, or sponsored by Roblox Corporation,
            Mojang, or Microsoft. All game names and trademarks are property of their respective owners.
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
    <div className="space-y-4">
      <h2 className="font-display text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
        {title}
      </h2>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
