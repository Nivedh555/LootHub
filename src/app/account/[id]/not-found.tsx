import Link from "next/link";
import { Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFoundItem() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center">
      <p className="font-display text-5xl text-primary">404</p>
      <h1 className="font-display text-2xl">We couldn&apos;t find that account</h1>
      <p className="max-w-md text-muted-foreground">
        It may have been removed by the owner, or never existed. Browse the marketplace
        for other game accounts.
      </p>
      <Link href="/accounts" className={buttonVariants({ variant: "primary" })}>
        <Home className="h-4 w-4" /> Browse accounts
      </Link>
    </div>
  );
}
