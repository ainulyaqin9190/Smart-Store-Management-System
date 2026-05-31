import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    const totalProducts =
      await prisma.product.count();

    const totalTransactions =
      await prisma.transaction.count();

    const products =
      await prisma.product.findMany();

    const transactions =
      await prisma.transaction.findMany();

    const totalStock =
      products.reduce(
        (sum, item) => sum + item.stock,
        0
      );

    const totalRevenue =
      transactions.reduce(
        (sum, item) => sum + item.total,
        0
      );

    return NextResponse.json({
      totalProducts,
      totalTransactions,
      totalStock,
      totalRevenue,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}