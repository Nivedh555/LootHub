"use client";

import dynamic from "next/dynamic";
import { CrateFallback } from "./crate-fallback";

// Note: next/dynamic's `loading` component can't receive props, so the
// fallback fills the loader's sized wrapper instead — identical box, zero CLS.
const CrateScene = dynamic(() => import("./crate-scene"), {
  ssr: false,
  loading: () => <CrateFallback fill />,
});

export function CrateLoader({ size = 330 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <CrateScene size={size} />
    </div>
  );
}
