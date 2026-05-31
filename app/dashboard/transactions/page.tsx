"use client";

import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Transaction {
  id: string;
  quantity: number;
  total: number;
  createdAt: string;
  product: Product;
}

export default function TransactionsPage() {

  const [products, setProducts] = useState<Product[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState("");

  // FETCH PRODUCTS
  async function fetchProducts() {

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

  // FETCH TRANSACTIONS
  async function fetchTransactions() {

    try {

      const response =
        await fetch("/api/transactions");

      const data =
        await response.json();

      setTransactions(data);

    } catch (error) {

      console.error(error);

    }
  }

  // LOAD DATA
  useEffect(() => {

    async function loadData() {

      await fetchProducts();

      await fetchTransactions();

    }

    loadData();

  }, []);

  // CREATE TRANSACTION
  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      const response =
        await fetch(
          "/api/transactions",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              productId,
              quantity: Number(quantity),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message
        );

      }

      alert("Transaksi berhasil");

      setProductId("");

      setQuantity("");

      await fetchProducts();

      await fetchTransactions();

    } catch (error) {

      console.error(error);

      alert("Gagal transaksi");

    }
  }

  return (

    <div className="p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">

        Dashboard Transactions

      </h1>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-zinc-900 p-4 rounded-xl mb-8"
      >

        <select
          value={productId}
          onChange={(e) =>
            setProductId(
              e.target.value
            )
          }
          className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
        >

          <option value="">

            Pilih Product

          </option>

          {products.map((product) => (

            <option
              key={product.id}
              value={product.id}
            >

              {product.name}
              {" | "}
              Stock:
              {product.stock}

            </option>

          ))}

        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              e.target.value
            )
          }
          className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg"
        >

          Create Transaction

        </button>

      </form>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full border border-zinc-700">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-3 border">
                Product
              </th>

              <th className="p-3 border">
                Quantity
              </th>

              <th className="p-3 border">
                Total
              </th>

              <th className="p-3 border">
                Date
              </th>

            </tr>

          </thead>

          <tbody>

            {transactions.map(
              (transaction) => (

                <tr
                  key={transaction.id}
                  className="text-center"
                >

                  <td className="p-3 border">

                    {
                      transaction.product
                        .name
                    }

                  </td>

                  <td className="p-3 border">

                    {
                      transaction.quantity
                    }

                  </td>

                  <td className="p-3 border">

                    Rp{" "}

                    {transaction.total.toLocaleString()}

                  </td>

                  <td className="p-3 border">

                    {new Date(
                      transaction.createdAt
                    ).toLocaleString()}

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