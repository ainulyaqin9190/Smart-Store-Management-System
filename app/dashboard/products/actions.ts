"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getAuthOr401 } from "@/lib/dal";

// Server Actions for product CRUD. Each one re-checks the session via DAL —
// the proxy is only an optimistic gate.

export interface FormState {
  ok: boolean;
  message?: string;
  // Field-level errors keyed by input name so the client can render inline.
  fieldErrors?: Partial<Record<"name" | "price" | "stock", string>>;
}

function parseFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const stockRaw = String(formData.get("stock") ?? "").trim();

  const fieldErrors: FormState["fieldErrors"] = {};

  if (!name) fieldErrors.name = "Nama wajib diisi";

  let price = Number(priceRaw);
  if (priceRaw === "" || Number.isNaN(price)) {
    fieldErrors.price = "Harga harus angka";
    price = NaN;
  } else if (price < 0) {
    fieldErrors.price = "Harga tidak boleh negatif";
  }

  let stock = Number(stockRaw);
  if (stockRaw === "" || !Number.isInteger(stock)) {
    fieldErrors.stock = "Stock harus bilangan bulat";
    stock = NaN;
  } else if (stock < 0) {
    fieldErrors.stock = "Stock tidak boleh negatif";
  }

  return { name, price, stock, fieldErrors };
}

async function ensureAdmin(): Promise<FormState | null> {
  const session = await getAuthOr401();
  if (!session) return { ok: false, message: "Belum login" };
  if (session.role !== "ADMIN") {
    return { ok: false, message: "Akses ditolak — hanya admin" };
  }
  return null;
}

export async function createProduct(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const forbidden = await ensureAdmin();
  if (forbidden) return forbidden;

  const { name, price, stock, fieldErrors } = parseFields(formData);
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Periksa kembali input", fieldErrors };
  }

  try {
    await prisma.product.create({ data: { name, price, stock } });
    revalidatePath("/dashboard/products");
    return { ok: true, message: "Product berhasil dibuat" };
  } catch (error) {
    console.error("createProduct error:", error);
    return { ok: false, message: "Gagal membuat product" };
  }
}

export async function updateProduct(
  id: string,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const forbidden = await ensureAdmin();
  if (forbidden) return forbidden;

  const { name, price, stock, fieldErrors } = parseFields(formData);
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Periksa kembali input", fieldErrors };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { name, price, stock },
    });
    revalidatePath("/dashboard/products");
    return { ok: true, message: "Product berhasil diupdate" };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, message: "Product tidak ditemukan" };
    }
    console.error("updateProduct error:", error);
    return { ok: false, message: "Gagal update product" };
  }
}

export async function deleteProduct(id: string): Promise<FormState> {
  const forbidden = await ensureAdmin();
  if (forbidden) return forbidden;

  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/dashboard/products");
    return { ok: true, message: "Product berhasil dihapus" };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      // FK violation — product is referenced by a Transaction.
      return {
        ok: false,
        message: "Tidak bisa hapus: product sudah punya transaksi",
      };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, message: "Product tidak ditemukan" };
    }
    console.error("deleteProduct error:", error);
    return { ok: false, message: "Gagal menghapus product" };
  }
}
