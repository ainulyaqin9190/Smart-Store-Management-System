"use client";

import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  async function loadProducts() {
    try {
      const response =
        await fetch("/api/products");

      const data =
        await response.json();

      setProducts(data);

    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreate(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      const response =
        await fetch(
          "/api/products",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              price: Number(price),
              stock: Number(stock),
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Gagal membuat product"
        );
      }

      setName("");
      setPrice("");
      setStock("");

      await loadProducts();

    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdate(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!editingId) return;

    try {
      const response =
        await fetch(
          `/api/products/${editingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              price: Number(price),
              stock: Number(stock),
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Gagal update product"
        );
      }

      setEditingId(null);

      setName("");
      setPrice("");
      setStock("");

      await loadProducts();

    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(
    id: string
  ) {
    const confirmed =
      confirm(
        "Hapus product ini?"
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `/api/products/${id}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Gagal menghapus"
        );
      }

      await loadProducts();

    } catch (error) {
      console.error(error);
    }
  }

  function handleEdit(
    product: Product
  ) {
    setEditingId(product.id);

    setName(product.name);

    setPrice(
      product.price.toString()
    );

    setStock(
      product.stock.toString()
    );
  }

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-black">
          Product Management
        </h1>

        <button
          onClick={loadProducts}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Load Products
        </button>

      </div>

      <form
        onSubmit={
          editingId
            ? handleUpdate
            : handleCreate
        }
        className="bg-white shadow rounded p-4 mb-6"
      >

        <div className="grid gap-4">

          <input
            type="text"
            placeholder="Nama Product"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="border p-3 rounded text-black"
          />

          <input
            type="number"
            placeholder="Harga"
            value={price}
            onChange={(e) =>
              setPrice(
                e.target.value
              )
            }
            className="border p-3 rounded text-black"
          />

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) =>
              setStock(
                e.target.value
              )
            }
            className="border p-3 rounded text-black"
          />

          <button
            type="submit"
            className="bg-green-600 text-white py-3 rounded"
          >
            {editingId
              ? "Update Product"
              : "Create Product"}
          </button>

        </div>

      </form>

      <div className="overflow-x-auto">

        <table className="w-full border bg-white">

          <thead>

            <tr>

              <th className="border p-3 text-black">
                Name
              </th>

              <th className="border p-3 text-black">
                Price
              </th>

              <th className="border p-3 text-black">
                Stock
              </th>

              <th className="border p-3 text-black">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {products.map(
              (product: Product) => (

                <tr
                  key={product.id}
                >

                  <td className="border p-3 text-black">
                    {product.name}
                  </td>

                  <td className="border p-3 text-black">
                    Rp{" "}
                    {product.price.toLocaleString()}
                  </td>

                  <td className="border p-3 text-black">
                    {product.stock}
                  </td>

                  <td className="border p-3">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          handleEdit(
                            product
                          )
                        }
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            product.id
                          )
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}