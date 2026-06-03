import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/dal";

// Storefront. Public — anyone can browse. Buying actions (cart, checkout)
// belong in /account and will require a USER session; for now this is a
// read-only product list.

export default async function ShopPage() {
  const [session, products] = await Promise.all([
    getSession(),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, price: true, stock: true },
    }),
  ]);

  const role = session?.user?.role ?? null;
  const isStaff = role === "ADMIN" || role === "OWNER";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              S
            </div>
            <span className="text-lg font-bold text-slate-900">Smart Store</span>
          </Link>

          <nav className="flex items-center gap-2">
            {isStaff ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : session?.user ? (
              <Link href="/account">
                <Button size="sm" variant="secondary">
                  Akun Saya
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Katalog Produk
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {products.length} produk tersedia
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
            Belum ada produk yang dipajang.
          </div>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <li
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center text-4xl">
                  📦
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 truncate" title={p.name}>
                  {p.name}
                </h3>
                <p className="mt-1 text-sm font-bold text-blue-600">
                  Rp {p.price.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-slate-500">
                  Stok: {p.stock > 0 ? p.stock : "Habis"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
