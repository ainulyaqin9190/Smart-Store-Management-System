"use client";

import { useState } from "react";

import { ProductForm } from "./ProductForm";
import { ProductTable } from "./ProductTable";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductsManagerProps {
  products: Product[];
  canManage: boolean;
}

// Client wrapper that owns the "currently editing" state shared between
// the form and the table. The list of products itself is pre-fetched on the
// server and arrives as a prop — no client fetch needed for initial render.

export function ProductsManager({ products, canManage }: ProductsManagerProps) {
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="space-y-6">
      {canManage && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              {editing ? `Edit: ${editing.name}` : "Tambah Product Baru"}
            </h2>
          </div>
          <ProductForm
            // `key` forces a fresh form (and useActionState reset) whenever
            // we switch between create and edit.
            key={editing?.id ?? "new"}
            editing={editing}
            onDone={() => setEditing(null)}
          />
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Daftar Product
          </h2>
          <span className="text-sm text-slate-500">
            {products.length} item
          </span>
        </div>
        <ProductTable
          products={products}
          canManage={canManage}
          onEdit={(p) => {
            setEditing(p);
            // Scroll the form back into view on mobile when an edit starts.
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
      </section>
    </div>
  );
}
