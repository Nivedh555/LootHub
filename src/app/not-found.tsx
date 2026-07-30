import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div className="pixel-stars pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-28 text-center">
        <p className="font-display text-5xl text-primary text-pixel sm:text-7xl" aria-hidden>
          404
        </p>
        <p className="font-display text-base text-secondary sm:text-xl">
          GAME OVER<span className="blink">_</span>
        </p>
        <h1 className="font-display text-sm leading-relaxed sm:text-base">
          This page dropped out of your inventory
        </h1>
        <p className="max-w-md text-muted-foreground">
          The page you were looking for respawned somewhere else, or never existed. Head
          back to the marketplace to keep browsing items.
        </p>
        <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
          <Home className="h-5 w-5" /> Continue? Back to home
        </Link>
      </div>
    </div>
  );
}
