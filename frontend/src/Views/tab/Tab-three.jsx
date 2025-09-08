import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = () => {
    fetch("http://localhost:5000/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok for products");
        }
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search
  }, [search]);

  const filteredProducts = products.filter((p) => {
    const searchTerm = search.toLowerCase();
    return (
      p.product_name.toLowerCase().includes(searchTerm) ||
      p.product_id.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allProductIds = filteredProducts.map((p) => p.product_id);
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (e, productId) => {
    if (e.target.checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleDeleteSelected = async () => {
    const result = await Swal.fire({
      title: `คุณแน่ใจหรือไม่?`,
      text: `คุณต้องการลบสินค้าที่เลือก ${selectedProducts.length} รายการใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("http://localhost:5000/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: selectedProducts }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "เกิดข้อผิดพลาดในการลบสินค้า");
        }

        Swal.fire("ลบแล้ว!", "สินค้าที่เลือกถูกลบเรียบร้อยแล้ว", "success");
        fetchProducts(); // Refresh the list
        setSelectedProducts([]); // Clear selection
      } catch (error) {
        Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">รายการสินค้า</h1>
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
            placeholder="ค้นหาด้วยชื่อ หรือ รหัสสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleDeleteSelected}
          className="btn btn-error"
          disabled={selectedProducts.length === 0}
        >
          ลบรายการที่เลือก ({selectedProducts.length})
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-200 text-black">
            <tr>
              <th className="px-4 py-2 border w-12">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  onChange={handleSelectAll}
                  checked={
                    filteredProducts.length > 0 &&
                    selectedProducts.length === filteredProducts.length
                  }
                />
              </th>
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
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  ไม่พบสินค้าที่ค้นหา
                </td>
              </tr>
            ) : (
              <>
                {currentItems.map((product, index) => (
                  <tr
                    key={product.product_id}
                    className="text-center text-black hover:bg-gray-100"
                  >
                    <td className="px-4 py-2 border">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-error checkbox-sm"
                        checked={selectedProducts.includes(product.product_id)}
                        onChange={(e) => handleSelectOne(e, product.product_id)}
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-4 py-2 border">{product.product_id}</td>
                    <td className="px-4 py-2 border">
                      {product.image_path ? (
                        <img
                          src={`http://localhost:5000${product.image_path}`}
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
                ))}
                {currentItems.length < itemsPerPage &&
                  Array.from({ length: itemsPerPage - currentItems.length }).map((_, index) => (
                    <tr key={`empty-${index}`} className="h-20 text-center">
                      <td colSpan="7">-</td>
                    </tr>
                  ))}
              </>
            )}
          </tbody>
          <tfoot className="bg-gray-200 text-black">
            <tr>
              <th className="px-4 py-2 border"></th>
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
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button className="join-item btn">
              Page {currentPage} of {totalPages}
            </button>
            <button
              className="join-item btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
