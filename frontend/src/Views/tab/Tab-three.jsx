import React, { useState, useEffect } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-black">รายการสินค้า</h1>
      <div className="mb-4">
        <label className="flex items-center border border-gray-400 rounded p-2 bg-white">
          <svg
            className="h-6 w-6 text-gray-500 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16l4-4-4-4m6 8l4-4-4-4"
            />
          </svg>
          <input
            type="search"
            className="w-full outline-none text-black"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-200 text-black">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">รหัสสินค้า</th>
              <th className="px-4 py-2 border">รูปสินค้า</th>
              <th className="px-4 py-2 border">ชื่อสินค้า</th>
              <th className="px-4 py-2 border">ราคา</th>
              <th className="px-4 py-2 border">คงเหลือในสต็อก</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr className="text-black">
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  ไม่พบสินค้าที่ค้นหา
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr key={product.product_id} className="text-center text-black">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">{product.product_id}</td>
                  <td className="px-4 py-2 border">
                    {product.image_path ? (
                      <img
                        src={product.image_path}
                        alt={product.product_name}
                        className="w-12 h-12 object-cover mx-auto"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2 border">{product.product_name}</td>
                  <td className="px-4 py-2 border">{product.price}</td>
                  <td className="px-4 py-2 border">{product.stock_quantity}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-gray-200 text-black">
            <tr>
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">รหัสสินค้า</th>
              <th className="px-4 py-2 border">รูปสินค้า</th>
              <th className="px-4 py-2 border">ชื่อสินค้า</th>
              <th className="px-4 py-2 border">ราคา</th>
              <th className="px-4 py-2 border">คงเหลือในสต็อก</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
