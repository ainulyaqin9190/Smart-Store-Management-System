"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  totalProducts: number;
  totalTransactions: number;
  totalStock: number;
  totalRevenue: number;
}

export default function DashboardPage() {

  const [data,
    setData] =
    useState<DashboardData | null>(
      null
    );

  useEffect(() => {

    async function loadData() {

      const response =
        await fetch(
          "/api/dashboard"
        );

      const result =
        await response.json();

      setData(result);
    }

    loadData();

  }, []);

  if (!data) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6 text-black">
        Smart Store Dashboard
      </h1>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-gray-500">
            Products
          </h2>

          <p className="text-3xl font-bold text-black">
            {data.totalProducts}
          </p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-gray-500">
            Transactions
          </h2>

          <p className="text-3xl font-bold text-black">
            {data.totalTransactions}
          </p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-gray-500">
            Stock
          </h2>

          <p className="text-3xl font-bold text-black">
            {data.totalStock}
          </p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-gray-500">
            Revenue
          </h2>

          <p className="text-3xl font-bold text-green-600">
            Rp{" "}
            {data.totalRevenue.toLocaleString()}
          </p>
        </div>

      </div>

    </div>
  );
}