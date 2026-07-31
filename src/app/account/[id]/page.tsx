import type { Metadata } from "next";
import { findAccountById, getAllAccounts } from "@/lib/server-store";
import { AccountView } from "@/components/account/account-view";
import { AutoRefresh } from "@/components/auto-refresh";
import NotFoundItem from "./not-found";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const account = await findAccountById(id);
  if (!account) return { title: "Account not found" };
  return {
    title: account.title,
    description: `${account.title} — ${account.game} account. ${account.description}`,
  };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const all = await getAllAccounts();
  const account = all.find((a) => a.id === id);
  if (!account) return <NotFoundItem />;

  const related = all
    .filter((a) => a.id !== account.id && a.game === account.game)
    .concat(all.filter((a) => a.id !== account.id && a.game !== account.game))
    .slice(0, 4);

  return (
    <>
      <AutoRefresh />
      <AccountView account={account} related={related} />
    </>
  );
}
