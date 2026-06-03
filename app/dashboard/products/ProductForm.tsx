"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

import { createProduct, updateProduct, type FormState } from "./actions";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductFormProps {
  editing: Product | null;
  onDone: () => void;
}

const initialState: FormState = { ok: false };

export function ProductForm({ editing, onDone }: ProductFormProps) {
  const action = editing
    ? updateProduct.bind(null, editing.id)
    : createProduct;

  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Toast + reset on each new server response.
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Berhasil");
      formRef.current?.reset();
      onDone();
    } else if (state.message && !state.fieldErrors) {
      // Only surface a top-level toast when there are no inline field errors —
      // otherwise the inline messages already tell the user what to fix.
      toast.error(state.message);
    }
  }, [state, onDone]);

  const errs = state?.fieldErrors;

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Nama Product"
        name="name"
        defaultValue={editing?.name ?? ""}
        error={errs?.name}
        className="sm:col-span-2"
        placeholder="Contoh: Indomie Goreng"
        required
      />
      <Field
        label="Harga (Rp)"
        name="price"
        type="number"
        min={0}
        step="any"
        defaultValue={editing?.price ?? ""}
        error={errs?.price}
        placeholder="0"
        required
      />
      <Field
        label="Stock"
        name="stock"
        type="number"
        min={0}
        step={1}
        defaultValue={editing?.stock ?? ""}
        error={errs?.stock}
        placeholder="0"
        required
      />

      <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        {editing && (
          <Button variant="secondary" onClick={onDone} type="button">
            Batal
          </Button>
        )}
        <SubmitButton editing={!!editing} />
      </div>
    </form>
  );
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? editing
          ? "Menyimpan..."
          : "Membuat..."
        : editing
          ? "Update Product"
          : "Create Product"}
    </Button>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

function Field({ label, name, error, className, ...rest }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={cn(
          "h-10 px-3 rounded-lg border bg-white text-slate-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          error
            ? "border-red-400 focus-visible:ring-red-500"
            : "border-slate-300",
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
