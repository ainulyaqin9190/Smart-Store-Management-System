import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CREATE TRANSACTION
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, quantity } = body;

    // VALIDASI
    if (!productId || !quantity) {
      return NextResponse.json(
        {
          message: "Semua field wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    // CARI PRODUCT
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    // PRODUCT TIDAK ADA
    if (!product) {
      return NextResponse.json(
        {
          message: "Product tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    // STOCK TIDAK CUKUP
    if (product.stock < quantity) {
      return NextResponse.json(
        {
          message: "Stock tidak cukup",
        },
        {
          status: 400,
        }
      );
    }

    // TOTAL
    const total = product.price * quantity;

    // CREATE TRANSACTION
    const transaction = await prisma.transaction.create({
      data: {
        productId,
        quantity,
        total,
      },
    });

    // UPDATE STOCK
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: product.stock - quantity,
      },
    });

    return NextResponse.json(
      {
        message: "Transaksi berhasil",
        transaction,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

// GET ALL TRANSACTIONS
export async function GET() {
  try {
    const transactions =
      await prisma.transaction.findMany({
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}