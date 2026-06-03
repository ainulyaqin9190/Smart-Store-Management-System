import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthOr401 } from "@/lib/dal";

// Dashboard summary — read-only, available to any authenticated user
// (the dashboard page itself is shown to both roles).

export async function GET() {
  const session = await getAuthOr401();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalProducts, totalTransactions, stockAgg, revenueAgg] =
      await Promise.all([
        prisma.product.count(),
        prisma.transaction.count(),
        prisma.product.aggregate({ _sum: { stock: true } }),
        prisma.transaction.aggregate({ _sum: { total: true } }),
      ]);

    return NextResponse.json({
      totalProducts,
      totalTransactions,
      totalStock: stockAgg._sum.stock ?? 0,
      totalRevenue: revenueAgg._sum.total ?? 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
