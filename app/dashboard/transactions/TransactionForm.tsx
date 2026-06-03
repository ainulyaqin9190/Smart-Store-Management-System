"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

import { createTransaction, type TxFormState } from "./actions";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface TransactionFormProps {
  products: Product[];
}

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const initialState: TxFormState = { ok: false };

export function TransactionForm({ products }: TransactionFormProps) {
  const [state, action] = useActionState(createTransaction, initialState);
  // Only used to compute the live total preview. Resets via formKey bump.
  const [preview, setPreview] = useState<{ productId: string; quantity: string }>({
    productId: "",
    quantity: "1",
  });
  const formRef = useRef<HTMLFormElement>(null);

  // Toast on each new server response. No state writes here.
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Transaksi berhasil");
      formRef.current?.reset();
      // Reset preview without violating set-state-in-effect: queue a microtask
      // so the write lands in a fresh React cycle, not the effect body.
      queueMicrotask(() => setPreview({ productId: "", quantity: "1" }));
    } else if (state.message && !state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state]);

  const selected = products.find((p) => p.id === preview.productId);
  const qtyNum = Number(preview.quantity);
  const previewTotal =
    selected && Number.isInteger(qtyNum) && qtyNum > 0
      ? selected.price * qtyNum
      : null;

  const errs = state?.fieldErrors;

  return (
    <form ref={formRef} action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2 flex flex-col gap-1">
        <label htmlFor="productId" className="text-sm font-medium text-slate-700">
          Product
        </label>
        <select
          id="productId"
          name="productId"
          value={preview.productId}
          onChange={(e) =>
            setPreview((p) => ({ ...p, productId: e.target.value }))
          }
          required
          className={cn(
            "h-10 px-3 rounded-lg border bg-white text-slate-900",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            errs?.productId
              ? "border-red-400 focus-visible:ring-red-500"
              : "border-slate-300",
          )}
        >
          <option value="">— Pilih product —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id} disabled={p.stock === 0}>
              {p.name} · {rupiah(p.price)} · Stock {p.stock}
              {p.stock === 0 ? " (habis)" : ""}
            </option>
          ))}
        </select>
        {errs?.productId && (
          <p className="text-xs text-red-600">{errs.productId}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
          Quantity
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          step={1}
          value={preview.quantity}
          onChange={(e) =>
            setPreview((p) => ({ ...p, quantity: e.target.value }))
          }
          required
          className={cn(
            "h-10 px-3 rounded-lg border bg-white text-slate-900",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            errs?.quantity
              ? "border-red-400 focus-visible:ring-red-500"
              : "border-slate-300",
          )}
        />
        {errs?.quantity && (
          <p className="text-xs text-red-600">{errs.quantity}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Total</span>
        <div className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center font-semibold text-slate-900">
          {previewTotal !== null ? rupiah(previewTotal) : "—"}
        </div>
      </div>

      <div className="sm:col-span-2 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Memproses..." : "Buat Transaksi"}
    </Button>
  );
}
