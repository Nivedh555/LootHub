export interface CryptoAsset {
  id: "usdt" | "ltc";
  label: string;
  network: string;
  symbol: string;
  address: string;
  deepLink: (amount: number) => string;
}

const usdtAddress =
  process.env.NEXT_PUBLIC_USDT_ADDRESS ??
  "0xc69e55ce6e8214976ea5925fe94f777f75787e84";
const ltcAddress =
  process.env.NEXT_PUBLIC_LTC_ADDRESS ??
  "LMFVrVVQbmbhoZ9xczTiRS37kh9eVxFStt";

export const cryptoAssets: CryptoAsset[] = [
  {
    id: "usdt",
    label: "Tether — USDT",
    network: "BEP20 (BSC)",
    symbol: "USDT",
    address: usdtAddress,
    deepLink: () => usdtAddress,
  },
  {
    id: "ltc",
    label: "Litecoin — LTC",
    network: "Litecoin Mainnet",
    symbol: "LTC",
    address: ltcAddress,
    deepLink: (amount) =>
      `litecoin:${ltcAddress}?amount=${amount.toFixed(8)}`,
  },
];