"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const router = useRouter();

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const q = String(data.get("q") ?? "").trim();
        router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
      }}
      className="flex w-full gap-2"
    >
      <div className="group relative flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
          aria-hidden
        />
        <Input
          name="q"
          type="search"
          placeholder="Try ‘Frost Dragon’, ‘Godly’, ‘Netherite’…"
          className="h-12 border-white/10 bg-white/5 pl-10 backdrop-blur-md transition-all duration-300 focus:border-primary/60 focus:bg-surface/80 focus:shadow-[0_0_28px_-8px_rgba(124,58,237,0.65)]"
          aria-label="Search in-game items"
        />
      </div>
      <Button type="submit" size="lg" variant="primary" className="shrink-0">
        <Search className="h-4 w-4" /> Search
      </Button>
    </form>
  );
}