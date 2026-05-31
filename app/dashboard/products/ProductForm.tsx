"use client";

import { useState } from "react";

interface Product {
  id?: string;
  name: string;
  price: number;
  stock: number;
}

interface Props {
  onSuccess: () => void;
  editProduct?: Product | null;
}

export default function ProductForm({
  onSuccess,
  editProduct,
}: Props) {
  const [name, setName] = useState(
    editProduct?.name || ""
  );

  const [price, setPrice] = useState(
    editProduct?.price || 0
  );

  const [stock, setStock] = useState(
    editProduct?.stock || 0
  );

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const url = editProduct
      ? `/api/products/${editProduct.id}`
      : "/api/products";

    const method = editProduct
      ? "PUT"
      : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        name,
        price,
        stock,
      }),
    });

    if (response.ok) {
      setName("");
      setPrice(0);
      setStock(0);

      onSuccess();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow mb-6"
    >
      <h2 className="text-xl font-bold mb-4 text-black">
        {editProduct
          ? "Edit Product"
          : "Create Product"}
      </h2>

      <input
        className="border p-2 w-full mb-3 text-black"
        placeholder="Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <input
        type="number"
        className="border p-2 w-full mb-3 text-black"
        placeholder="Price"
        value={price}
        onChange={(e) =>
          setPrice(Number(e.target.value))
        }
      />

      <input
        type="number"
        className="border p-2 w-full mb-3 text-black"
        placeholder="Stock"
        value={stock}
        onChange={(e) =>
          setStock(Number(e.target.value))
        }
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {editProduct
          ? "Update"
          : "Create"}
      </button>
    </form>
  );
}