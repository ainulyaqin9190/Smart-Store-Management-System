import { EmptyState } from "@/components/ui/EmptyState";

interface TransactionRow {
  id: string;
  quantity: number;
  total: number;
  createdAt: Date;
  product: { name: string };
}

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function TransactionTable({
  transactions,
}: {
  transactions: TransactionRow[];
}) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Belum ada transaksi"
        description="Buat transaksi pertama lewat form di atas."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12" aria-hidden>
            <path d="M17 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 23l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <ul className="md:hidden space-y-3">
        {transactions.map((t) => (
          <li
            key={t.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {t.product.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {dateFmt.format(new Date(t.createdAt))}
                </p>
              </div>
              <p className="font-bold text-emerald-600 text-right shrink-0">
                {rupiah(t.total)}
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-600">Qty: {t.quantity}</p>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Product</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Quantity</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Total</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {t.product.name}
                </td>
                <td className="px-4 py-3 text-slate-700">{t.quantity}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">
                  {rupiah(t.total)}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {dateFmt.format(new Date(t.createdAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
