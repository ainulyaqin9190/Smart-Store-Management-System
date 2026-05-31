"use client";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDeleted: () => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDeleted,
}: Props) {
  async function handleDelete(
    id: string
  ) {
    const confirmDelete =
      confirm(
        "Yakin ingin menghapus?"
      );

    if (!confirmDelete) return;

    await fetch(
      `/api/products/${id}`,
      {
        method: "DELETE",
      }
    );

    onDeleted();
  }

  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th className="border p-3">
            Name
          </th>

          <th className="border p-3">
            Price
          </th>

          <th className="border p-3">
            Stock
          </th>

          <th className="border p-3">
            Action
          </th>
        </tr>
      </thead>

      <tbody>
        {products.map(
          (product) => (
            <tr key={product.id}>
              <td className="border p-3">
                {product.name}
              </td>

              <td className="border p-3">
                Rp{" "}
                {product.price.toLocaleString()}
              </td>

              <td className="border p-3">
                {product.stock}
              </td>

              <td className="border p-3">
                <button
                  onClick={() =>
                    onEdit(product)
                  }
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
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
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
}