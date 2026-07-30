import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: { default: "LootHub — Roblox & Minecraft Items · Crypto Checkout", template: "%s · LootHub" },
  description: site.description,
  applicationName: site.name,
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "LootHub — In-Game Items · Crypto Checkout",
    description: site.description,
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <CartProvider>
          <Navbar />
          <main id="main" className="flex-1 pt-[4.5rem]">
            {children}
          </main>
          <Footer />
          <SpeedInsights />
        </CartProvider>
      </body>
    </html>
  );
}