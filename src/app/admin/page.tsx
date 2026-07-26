import { getUploadedProducts } from "@/lib/server-store";
import { Admin } from "@/components/admin/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const uploaded = await getUploadedProducts();
  return <Admin initialUploaded={uploaded} />;
}