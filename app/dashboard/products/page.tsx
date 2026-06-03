import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

import { ProductsManager } from "./ProductsManager";

// Server Component. Auth check + data fetch happens before HTML is shipped,
// so users see the populated table on first paint — no fetch waterfall.

export default async function ProductsPage() {
  const session = await verifySession();
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Product Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {session.role === "ADMIN"
            ? "Kelola katalog product toko — tambah, edit, atau hapus."
            : "Lihat katalog product toko. Hanya admin yang bisa mengubah data."}
        </p>
      </div>

      <ProductsManager
        products={products}
        canManage={session.role === "ADMIN"}
      />
    </div>
  );
}
