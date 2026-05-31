import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE PRODUCT
export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } =
      await context.params;

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message:
        "Product berhasil dihapus",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

// UPDATE PRODUCT
export async function PUT(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } =
      await context.params;

    const body =
      await req.json();

    const {
      name,
      price,
      stock,
    } = body;

    const updatedProduct =
      await prisma.product.update({
        where: {
          id,
        },

        data: {
          name,
          price:
            Number(price),

          stock:
            Number(stock),
        },
      });

    return NextResponse.json({
      message:
        "Product berhasil diupdate",

      product:
        updatedProduct,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}