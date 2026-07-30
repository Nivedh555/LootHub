"use client";

import dynamic from "next/dynamic";
import { CrateFallback } from "./crate-fallback";

const CrateScene = dynamic(() => import("./crate-scene"), {
  ssr: false,
  loading: () => <CrateFallback />,
});

export function CrateLoader({ size = 330 }: { size?: number }) {
  return <CrateScene size={size} />;
}
