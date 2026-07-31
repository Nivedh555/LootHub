import { getAllAccounts } from "@/lib/server-store";
import { GameAccountsGrid } from "@/components/game-accounts-grid";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAllAccounts();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl">Game Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Premium Minecraft, Roblox and other game accounts. Full access. Instant delivery via Discord.
        </p>
      </div>
      <GameAccountsGrid accounts={accounts} />
    </main>
  );
}
