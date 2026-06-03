import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

import { TransactionForm } from "./TransactionForm";
import { TransactionTable } from "./TransactionTable";

// Server Component. Both products (for the dropdown) and transactions are
// pre-fetched in parallel before HTML ships.

export default async function TransactionsPage() {
  await verifySession();

  const [products, transactions] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, stock: true },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true } } },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Catat penjualan baru dan pantau riwayat transaksi.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <h2 className="text-base font-semibold text-slate-900">
            Transaksi Baru
          </h2>
        </div>
        <TransactionForm products={products} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Riwayat</h2>
          <span className="text-sm text-slate-500">
            {transactions.length} transaksi
          </span>
        </div>
        <TransactionTable transactions={transactions} />
      </section>
    </div>
  );
}
