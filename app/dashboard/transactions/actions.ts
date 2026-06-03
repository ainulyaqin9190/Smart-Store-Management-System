"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getAuthOr401 } from "@/lib/dal";

export interface TxFormState {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"productId" | "quantity", string>>;
}

export async function createTransaction(
  _prev: TxFormState | undefined,
  formData: FormData,
): Promise<TxFormState> {
  const session = await getAuthOr401();
  if (!session) return { ok: false, message: "Belum login" };

  const productId = String(formData.get("productId") ?? "");
  const qtyRaw = String(formData.get("quantity") ?? "").trim();

  const fieldErrors: TxFormState["fieldErrors"] = {};
  if (!productId) fieldErrors.productId = "Pilih product";

  const qty = Number(qtyRaw);
  if (qtyRaw === "" || !Number.isInteger(qty) || qty <= 0) {
    fieldErrors.quantity = "Quantity harus bilangan bulat > 0";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Periksa kembali input", fieldErrors };
  }

  // Atomic decrement + transaction insert. The conditional `stock: { gte: qty }`
  // makes this race-safe — concurrent sales can't drive stock negative.
  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });

      await tx.transaction.create({
        data: {
          productId: product.id,
          quantity: qty,
          total: product.price * qty,
        },
      });
    });

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { ok: true, message: "Transaksi berhasil" };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      const exists = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      return {
        ok: false,
        message: exists ? "Stock tidak cukup" : "Product tidak ditemukan",
      };
    }
    console.error("createTransaction error:", error);
    return { ok: false, message: "Gagal membuat transaksi" };
  }
}
