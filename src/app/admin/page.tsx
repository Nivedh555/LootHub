import { isAdminRequest } from "@/lib/auth";
import { getAllOrders, getAllProducts } from "@/lib/server-store";
import { Admin } from "@/components/admin/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminRequest();
  const [products, orders] = authed
    ? await Promise.all([getAllProducts(), getAllOrders()])
    : [[], []];
  return <Admin authed={authed} initialProducts={products} initialOrders={orders} />;
}
