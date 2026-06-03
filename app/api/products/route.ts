import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthOr401 } from "@/lib/dal";

// GET — any authenticated user (USER + ADMIN).
// POST — ADMIN only. Product CRUD is an admin action.

export async function GET() {
  const session = await getAuthOr401();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
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
  if (session.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, price, stock } = body as {
      name?: string;
      price?: number;
      stock?: number;
    };

    // `!price`/`!stock` would reject 0 — use explicit null checks instead.
    if (!name || price == null || stock == null) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (
      Number.isNaN(priceNum) ||
      Number.isNaN(stockNum) ||
      priceNum < 0 ||
      stockNum < 0
    ) {
      return NextResponse.json(
        { message: "Harga dan stock harus angka non-negatif" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: { name, price: priceNum, stock: stockNum },
    });

    return NextResponse.json(
      { message: "Product berhasil dibuat", product },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
