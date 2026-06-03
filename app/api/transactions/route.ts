import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getAuthOr401 } from "@/lib/dal";

// GET — any authenticated user (USER + ADMIN).
// POST — any authenticated user can record a sale.

export async function GET() {
  const session = await getAuthOr401();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getAuthOr401();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { productId, quantity } = body as {
      productId?: string;
      quantity?: number;
    };

    if (!productId || quantity == null) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return NextResponse.json(
        { message: "Quantity harus bilangan bulat positif" },
        { status: 400 }
      );
    }

    // Atomic + race-safe. The conditional update with `stock: { gte: qty }`
    // fails if stock has been drained by a concurrent transaction; Prisma
    // raises P2025 ("record not found") which we map to a clean 400. Both
    // statements run in a single DB transaction so a partial state is
    // impossible.
    try {
      const transaction = await prisma.$transaction(async (tx) => {
        const product = await tx.product.update({
          where: { id: productId, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });

        return tx.transaction.create({
          data: {
            productId: product.id,
            quantity: qty,
            total: product.price * qty,
          },
          include: { product: true },
        });
      });

      return NextResponse.json(
        { message: "Transaksi berhasil", transaction },
        { status: 201 }
      );
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        // Either the product doesn't exist or stock is insufficient — we
        // can't distinguish without a second query, so report the common case.
        const exists = await prisma.product.findUnique({
          where: { id: productId },
          select: { id: true },
        });
        return NextResponse.json(
          {
            message: exists
              ? "Stock tidak cukup"
              : "Product tidak ditemukan",
          },
          { status: exists ? 400 : 404 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
