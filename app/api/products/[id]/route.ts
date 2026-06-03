import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthOr401 } from "@/lib/dal";

// Single-product mutations — ADMIN only.

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, context: RouteContext) {
  const session = await getAuthOr401();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, price, stock } = body as {
      name?: string;
      price?: number;
      stock?: number;
    };

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

    const product = await prisma.product.update({
      where: { id },
      data: { name, price: priceNum, stock: stockNum },
    });

    return NextResponse.json({
      message: "Product berhasil diupdate",
      product,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await getAuthOr401();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
