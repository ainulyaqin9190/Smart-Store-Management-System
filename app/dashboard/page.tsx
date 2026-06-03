import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

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

export default async function DashboardPage() {
  const session = await verifySession();

  const [totalProducts, totalTransactions, stockAgg, revenueAgg, recent] =
    await Promise.all([
      prisma.product.count(),
      prisma.transaction.count(),
      prisma.product.aggregate({ _sum: { stock: true } }),
      prisma.transaction.aggregate({ _sum: { total: true } }),
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { product: { select: { name: true } } },
      }),
    ]);

  const totalStock = stockAgg._sum.stock ?? 0;
  const totalRevenue = revenueAgg._sum.total ?? 0;

  const cards = [
    {
      label: "Products",
      value: totalProducts.toLocaleString("id-ID"),
      accent: "bg-blue-100 text-blue-700",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
          <path d="M21 8V21H3V8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      ),
    },
    {
      label: "Transactions",
      value: totalTransactions.toLocaleString("id-ID"),
      accent: "bg-emerald-100 text-emerald-700",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
          <path d="M17 1l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      ),
    },
    {
      label: "Total Stock",
      value: totalStock.toLocaleString("id-ID"),
      accent: "bg-amber-100 text-amber-700",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: "Revenue",
      value: rupiah(totalRevenue),
      accent: "bg-violet-100 text-violet-700",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Halo, {session.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan toko hari ini.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                {c.label}
              </span>
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${c.accent}`}
              >
                {c.icon}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 break-words">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Transaksi Terbaru
          </h2>
          <span className="text-xs text-slate-500">5 terakhir</span>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Belum ada transaksi.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((t) => (
              <li
                key={t.id}
                className="px-5 md:px-6 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {t.product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.quantity} pcs · {dateFmt.format(new Date(t.createdAt))}
                  </p>
                </div>
                <span className="font-semibold text-emerald-600 shrink-0">
                  {rupiah(t.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
