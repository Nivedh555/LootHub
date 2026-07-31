export const site = {
  name: "LootHub",
  tagline: "In-game items for Roblox & Minecraft. Pay with crypto, claim via Discord.",
  description:
    "Buy Adopt Me!, MM2, Grow a Garden, Steal a Brainrot, and Donut SMP items. Pay with USDT (BEP20) or Litecoin, then open a Discord ticket to receive your item in-game.",
  email: "support@loothub.gg",
  nav: [
    { label: "Browse", href: "/browse" },
    { label: "Accounts", href: "/accounts" },
    { label: "Shop", href: "/#shop" },
    { label: "Games", href: "/#games" },
    { label: "How it works", href: "/#how" },
    { label: "FAQ", href: "/#faq" },
  ],
};

export const discord = {
  ticketUrl: process.env.NEXT_PUBLIC_DISCORD_TICKET_URL ?? "https://discord.gg/P4WutZFGYr",
  serverName: process.env.NEXT_PUBLIC_DISCORD_SERVER_NAME ?? "LootHub Discord",
};