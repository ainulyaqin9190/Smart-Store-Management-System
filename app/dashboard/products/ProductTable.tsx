"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";

import { deleteProduct } from "./actions";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductTableProps {
  products: Product[];
  canManage: boolean;
  onEdit: (p: Product) => void;
}

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export function ProductTable({ products, canManage, onEdit }: ProductTableProps) {
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    startTransition(async () => {
      const result = await deleteProduct(target.id);
      if (result.ok) {
        toast.success(result.message ?? "Product dihapus");
      } else {
        toast.error(result.message ?? "Gagal menghapus");
      }
      setPendingDelete(null);
    });
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="Belum ada product"
        description={
          canManage
            ? "Tambahkan product pertama lewat form di atas."
            : "Hubungi admin untuk menambahkan product."
        }
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12" aria-hidden>
            <path d="M21 8V21H3V8" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="1" y="3" width="22" height="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <ul className="md:hidden space-y-3">
        {products.map((p) => (
          <li
            key={p.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                <p className="text-sm text-slate-500">{rupiah(p.price)}</p>
              </div>
              <StockBadge stock={p.stock} />
            </div>
            {canManage && (
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(p)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPendingDelete(p)}
                  disabled={isPending}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Price</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Stock</th>
              {canManage && (
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-4 py-3 text-slate-700">{rupiah(p.price)}</td>
                <td className="px-4 py-3">
                  <StockBadge stock={p.stock} />
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setPendingDelete(p)}
                        disabled={isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Hapus product?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" akan dihapus permanen. Aksi ini tidak bisa dibatalkan.`
            : undefined
        }
        confirmLabel={isPending ? "Menghapus..." : "Hapus"}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const tone =
    stock === 0
      ? "bg-red-100 text-red-700"
      : stock < 10
        ? "bg-amber-100 text-amber-800"
        : "bg-emerald-100 text-emerald-800";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tone}`}
    >
      {stock} pcs
    </span>
  );
}
