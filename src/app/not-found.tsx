import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-28 text-center">
      <p className="font-display text-7xl text-primary text-glow">404</p>
      <h1 className="font-display text-3xl">This page dropped out of your inventory</h1>
      <p className="max-w-md text-muted-foreground">
        The page you were looking for respawned somewhere else, or never existed. Head
        back to the marketplace to keep browsing game keys.
      </p>
      <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
        <Home className="h-5 w-5" /> Back to home
      </Link>
    </div>
  );
}