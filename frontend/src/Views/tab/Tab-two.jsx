// src/pages/ExportPage.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ExportPage() {
  const [products, setProducts] = useState([]);
  const [tempList, setTempList] = useState([]); // เก็บสินค้าชั่วคราว
  const [exportHistory, setExportHistory] = useState([]); // เก็บประวัติการส่งออก
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({
    productId: "",
    productName: "",
    quantity: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchExportHistory();
  }, []);

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

  const fetchExportHistory = () => {
    fetch("http://localhost:5000/exports")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok for exports");
        }
        return res.json();
      })
      .then((data) => setExportHistory(data))
      .catch((err) => console.error("Error fetching export history:", err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "productId") {
      const selectedProduct = products.find((p) => p.product_id === value);
      setForm((prev) => ({
        ...prev,
        productId: value,
        productName: selectedProduct ? selectedProduct.product_name : "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // เพิ่มเข้า list ชั่วคราว
  const handleAddToTempList = () => {
    const { productId, quantity, productName } = form;
    if (!productId || !quantity) {
      Swal.fire("ข้อผิดพลาด", "กรุณาเลือกรหัสสินค้าและใส่จำนวน", "error");
      return;
    }

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      Swal.fire("ข้อผิดพลาด", "จำนวนต้องเป็นตัวเลขที่มากกว่า 0", "error");
      return;
    }

    const existingProduct = products.find((p) => p.product_id === productId);
    if (!existingProduct) {
      Swal.fire("ข้อผิดพลาด", "ไม่พบสินค้านี้ในระบบ", "error");
      return;
    }

    if (existingProduct.stock_quantity < numQuantity) {
      Swal.fire(
        "สต็อกไม่เพียงพอ",
        `สินค้า ${productName} มีในสต็อกเพียง ${existingProduct.stock_quantity} ชิ้น`,
        "warning"
      );
      return;
    }

    const newItem = {
      product_id: productId,
      product_name: productName,
      quantity: numQuantity,
    };

    setTempList((prev) => [...prev, newItem]);
    setForm({ productId: "", productName: "", quantity: "" }); // Reset form
  };

  // ส่งข้อมูลสินค้าไปยัง API Export
  const handleSubmitExport = async () => {
    if (tempList.length === 0) {
      Swal.fire("ไม่มีรายการ", "กรุณาเพิ่มสินค้าในลิสต์ก่อนส่งออก", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "ยืนยันการส่งออก?",
      text: `คุณต้องการส่งออกสินค้าทั้งหมด ${tempList.length} รายการใช่หรือไม่?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch("http://localhost:5000/exports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: tempList }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "เกิดข้อผิดพลาดในการส่งออก");
        }

        await response.json();
        Swal.fire("สำเร็จ!", "การส่งออกเสร็จสมบูรณ์", "success");
        setTempList([]);
        fetchProducts(); // Refresh product list for updated stock
        fetchExportHistory(); // Refresh export history
      } catch (error) {
        Swal.fire("เกิดข้อผิดพลาด!", error.message, "error");
      }
    }
  };

  const handleCancelList = () => {
    if (tempList.length === 0) return;
    Swal.fire({
      title: "คุณต้องการยกเลิกลิสต์หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        setTempList([]);
      }
    });
  };

  // Pagination logic for export history
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistoryItems = exportHistory.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(exportHistory.length / itemsPerPage);

  return (
    <div>
      <h1 className="text-2xl font-bold text-black p-4">ส่งออกสินค้า</h1>
      <div className="flex flex-col lg:flex-row">
        {/* ฟอร์มกรอก */}
        <div className="p-4 min-w-80 max-w-80 border-r border-gray-300">
          <ul className="space-y-2">
            <li>
              <select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                className="select select-warning w-full bg-white text-black"
              >
                <option value="">-- เลือกรหัสสินค้า --</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.product_id} - {p.product_name} (คงเหลือ: {p.stock_quantity})
                  </option>
                ))}
              </select>
            </li>
            <li>
              <input
                type="text"
                name="productName"
                value={form.productName}
                placeholder="ชื่อสินค้า"
                className="input input-warning w-full bg-white focus:border-amber-700 text-black"
                readOnly
              />
            </li>
            <li>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="จำนวน"
                className="input input-warning w-full bg-white focus:border-amber-700 text-black"
                min="1"
              />
            </li>
            {/* แสดงรายการสินค้าใน tempList */}
            <li className="w-80">
              <div className="text-sm text-black">
                <h3 className="font-bold my-2">รายการรอส่งออก:</h3>
                <ul className="flex flex-col max-h-40 overflow-y-auto space-y-1 pr-1">
                  {tempList.length === 0 ? (
                    <li className="text-gray-400">ยังไม่มีสินค้าในลิสต์</li>
                  ) : (
                    tempList.map((item, i) => (
                      <li
                        key={i}
                        className="truncate bg-amber-300 rounded pl-2 pr-2 py-1 w-1/2"
                        title={`${item.product_name} (${item.quantity})`}
                      >
                        {i + 1}. {item.product_name} ({item.quantity})
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </li>
            <li className="flex flex-col gap-2 mt-4">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToTempList}
                  className="btn btn-outline btn-warning"
                >
                  ลงลิสต์
                </button>
                <button
                  onClick={handleCancelList}
                  className="btn btn-error"
                  disabled={tempList.length === 0}
                >
                  ยกเลิกลิสต์
                </button>
              </div>
              <button
                onClick={handleSubmitExport}
                className="btn btn-success w-full"
                disabled={tempList.length === 0}
              >
                ยืนยันการส่งออก
              </button>
            </li>
          </ul>
        </div>
        {/* ตารางแสดงประวัติการส่งออก */}
        <div className="flex-1 p-4 text-black">
          <div className="overflow-x-auto rounded-box border border-black bg-black/5 border-b-2">
            <table className="table w-full bg-white text-black">
              <thead className="text-black">
                <tr>
                  <th>รหัสการส่งออก</th>
                  <th>รูปสินค้า</th>
                  <th>รหัสสินค้า</th>
                  <th>ชื่อสินค้า</th>
                  <th>จำนวน</th>
                  <th>วันที่</th>
                </tr>
              </thead>
              <tbody>
                {exportHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-4">
                      ยังไม่มีสินค้าในตาราง
                    </td>
                  </tr>
                ) : (
                  <>
                    {currentHistoryItems.map((item) => (
                      <tr key={item.export_id}>
                        <td className="py-3">{item.export_id}</td>
                        <td className="py-3">
                          {item.image_path ? (
                            <img
                              src={`http://localhost:5000${item.image_path}`}
                              alt={item.product_name}
                              className="w-10 h-10 object-contain rounded-md"
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3">{item.product_id}</td>
                        <td className="py-3">{item.product_name}</td>
                        <td className="py-3">{item.quantity}</td>
                        <td className="py-3">
                          {new Date(item.export_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {currentHistoryItems.length < itemsPerPage &&
                      Array.from({ length: itemsPerPage - currentHistoryItems.length }).map((_, index) => (
                        <tr key={`empty-${index}`} className="h-16 text-center">
                          <td colSpan="6">-</td>
                        </tr>
                      ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 ? (
            <div className="flex justify-center mt-4">
              <div className="join">
                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >«</button>
                <button className="join-item btn">
                  Page {currentPage} of {totalPages}
                </button>
                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >»</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <div className="join">
                <button className="join-item btn btn-disabled">«</button>
                <button className="join-item btn btn-disabled">-</button>
                <button className="join-item btn btn-disabled">»</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
