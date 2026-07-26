"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps server-rendered product data fresh: re-fetches the current route
 * when the tab regains focus and on a slow interval, so stock changes and
 * deleted listings show up without a manual reload.
 */
export function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = window.setInterval(refresh, intervalMs);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, intervalMs]);

  return null;
}
