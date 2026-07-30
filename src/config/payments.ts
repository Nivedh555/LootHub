export interface CryptoAsset {
  id: "usdt" | "ltc";
  label: string;
  network: string;
  symbol: string;
  address: string;
  deepLink: (amount: number) => string;
}

const usdtAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS;
const ltcAddress = process.env.NEXT_PUBLIC_LTC_ADDRESS;

// Fail fast at runtime in production if addresses are missing.
// Skip during build/prerender (NEXT_PHASE === 'phase-production-build').
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (!isBuildPhase && process.env.NODE_ENV === "production") {
  if (!usdtAddress || usdtAddress.length === 0) {
    throw new Error("NEXT_PUBLIC_USDT_ADDRESS must be set in production.");
  }
  if (!ltcAddress || ltcAddress.length === 0) {
    throw new Error("NEXT_PUBLIC_LTC_ADDRESS must be set in production.");
  }
}

const safeUsdt = usdtAddress ?? "0x0000000000000000000000000000000000000000";
const safeLtc = ltcAddress ?? "LXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

export const cryptoAssets: CryptoAsset[] = [
  {
    id: "usdt",
    label: "Tether — USDT",
    network: "BEP20 (BSC)",
    symbol: "USDT",
    address: safeUsdt,
    deepLink: () => safeUsdt,
  },
  {
    id: "ltc",
    label: "Litecoin — LTC",
    network: "Litecoin Mainnet",
    symbol: "LTC",
    address: safeLtc,
    deepLink: (amount) =>
      `litecoin:${safeLtc}?amount=${amount.toFixed(8)}`,
  },
];
