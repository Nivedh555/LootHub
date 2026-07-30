import Link from "next/link";
import { Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFoundItem() {
  return (
    <div className="relative overflow-hidden">
      <div className="pixel-stars pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center">
        <p className="font-display text-4xl text-primary text-pixel sm:text-5xl" aria-hidden>
          404
        </p>
        <p className="font-display text-sm text-secondary sm:text-base">
          ITEM NOT FOUND<span className="blink">_</span>
        </p>
        <h1 className="font-display text-xs leading-relaxed sm:text-sm">
          We couldn&apos;t find that item
        </h1>
        <p className="max-w-md text-muted-foreground">
          It may have been removed by the owner, or never existed. Browse the marketplace
          for other items.
        </p>
        <Link href="/browse" className={buttonVariants({ variant: "primary" })}>
          <Home className="h-4 w-4" /> Browse marketplace
        </Link>
      </div>
    </div>
  );
}
