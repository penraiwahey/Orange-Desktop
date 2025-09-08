import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ProductsPage() {
  const [existingProducts, setExistingProducts] = useState([]);
  const [tempList, setTempList] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [form, setForm] = useState({
    orderId: "",
    productId: "",
    productName: "",
    quantity: "",
    price: "",
    file: null,
    imageUrl: "",
  });

  const fetchImportHistory = () => {
    fetch("http://localhost:5000/imports")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok for imports");
        }
        return res.json();
      })
      .then((data) => setImportHistory(data))
      .catch((err) => console.error("Error fetching imports:", err));
  };

  const fetchExistingProducts = () => {
    fetch("http://localhost:5000/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok for products");
        }
        return res.json();
      })
      .then((data) => setExistingProducts(data))
      .catch((err) => {
        console.error("Error fetching products:", err);
        Swal.fire("Error", "Failed to load products data.", "error");
      });
  };

  useEffect(() => {
    fetchImportHistory();
    fetchExistingProducts();
  }, []);

  const handleProductTypeChange = (isNew) => {
    setIsNewProduct(isNew);
    setForm((prev) => ({
      ...prev,
      productId: "",
      productName: "",
      file: null,
      price: "",
      imageUrl: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "productId" && !isNewProduct) {
      const selectedProduct = existingProducts.find((p) => p.product_id === value);
      setForm((prev) => ({
        ...prev,
        productId: value,
        productName: selectedProduct ? selectedProduct.product_name : "",
        imageUrl: selectedProduct?.image_path ? `http://localhost:5000${selectedProduct.image_path}` : "",
        file: null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
      // If a file is being uploaded, clear the imageUrl.
      imageUrl: files ? "" : prev.imageUrl,
    }));
  };

  const handleAddToTempList = () => {
    const { productId, quantity, productName } = form;

    if (!quantity || parseInt(quantity, 10) <= 0) {
      Swal.fire("ข้อผิดพลาด", "กรุณาใส่จำนวนที่ถูกต้อง", "error");
      return;
    }

    if (isNewProduct) {
      if (!productId.trim() || !productName.trim()) {
        Swal.fire("ข้อผิดพลาด", "สำหรับสินค้าใหม่ กรุณากรอกรหัสและชื่อสินค้า", "error");
        return;
      }
      if (existingProducts.some((p) => p.product_id === productId.trim())) {
        Swal.fire("ข้อผิดพลาด", `รหัสสินค้า '${productId.trim()}' มีอยู่แล้วในระบบ`, "error");
        return;
      }
    } else {
      if (!productId) {
        Swal.fire("ข้อผิดพลาด", "กรุณาเลือกสินค้าที่มีอยู่", "error");
        return;
      }
    }

    const finalProductName = isNewProduct
      ? productName.trim()
      : existingProducts.find((p) => p.product_id === productId)?.product_name || "";

    const itemToAdd = { ...form, productName: finalProductName };

    setTempList((prev) => [...prev, itemToAdd]);
    // Reset only product-specific fields, keep orderId for the batch
    setForm({
      orderId: form.orderId, // Keep the current orderId for the batch
      productId: "",
      productName: "",
      quantity: "",
      price: "",
      file: null,
      imageUrl: "",
    });
    Swal.fire("ลงลิสต์สำเร็จ!", "", "success");
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

  const handleConfirmImport = async () => {
    if (tempList.length === 0) {
      Swal.fire("ไม่มีรายการ", "กรุณาเพิ่มสินค้าในลิสต์ก่อน", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "ยืนยันการนำเข้าสินค้า?",
      text: `คุณต้องการนำเข้าสินค้าทั้งหมด ${tempList.length} รายการใช่หรือไม่?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      const formData = new FormData();

      formData.append('orderId', form.orderId); // Add the custom Order ID to the form data
      // 1. Prepare the metadata for each item
      const itemsToImport = tempList.map((item) => ({
        product_id: item.productId.trim(),
        product_name: item.productName.trim(),
        quantity: parseInt(item.quantity, 10),
        price: item.price,
        // Include the original filename if a file exists, to map on the backend
        original_filename: item.file ? item.file.name : null,
      }));

      // 2. Append the metadata array as a JSON string
      formData.append('items', JSON.stringify(itemsToImport));

      // 3. Append all the files
      tempList.forEach(item => {
        if (item.file) {
          // The field name 'files' must match what multer expects on the backend
          formData.append('files', item.file);
        }
      });

      const response = await fetch("http://localhost:5000/imports", {
        method: "POST",
        // DO NOT set Content-Type header, the browser does it for you with FormData
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "เกิดข้อผิดพลาดในการนำเข้า");
      }

      await response.json();
      Swal.fire("สำเร็จ!", "นำเข้าสินค้าเรียบร้อยแล้ว", "success");

      setTempList([]);
      // Reset the form, including orderId
      setForm({
        orderId: "",
        productId: "",
        productName: "",
        quantity: "",
        price: "",
        file: null,
        imageUrl: "",
      });
      fetchImportHistory();
      fetchExistingProducts();
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด!", err.message, "error");
    }
  };

  // Pagination logic for import history
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistoryItems = importHistory.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(importHistory.length / itemsPerPage);

  return (
    <div>
      <h1 className="text-2xl font-bold text-black p-4">นำเข้าสินค้า</h1>
      <div className="flex flex-col lg:flex-row">
        {/* ฟอร์มกรอก */}
        <div className="p-4 min-w-80 max-w-80 border-r border-gray-300">
          <ul className="space-y-2">
            <li>
              <input
                type="text"
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                placeholder="รหัสหมายเลขจัดซื้อ"
                className="input input-warning w-full bg-white focus:border-amber-700 text-black"
              />
            </li>
            <li className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text text-black">สินค้าที่มีอยู่</span>
                <input type="radio" name="productType" className="radio radio-warning" checked={!isNewProduct} onChange={() => handleProductTypeChange(false)} />
              </label>
              <label className="label cursor-pointer ml-4">
                <span className="label-text text-black">สินค้าใหม่</span>
                <input type="radio" name="productType" className="radio radio-warning" checked={isNewProduct} onChange={() => handleProductTypeChange(true)} />
              </label>
            </li>

            {isNewProduct ? (
              <>
                <li>
                  <input type="text" name="productId" value={form.productId} onChange={handleChange} placeholder="รหัสสินค้าใหม่" className="input input-warning w-full bg-white text-black" />
                </li>
                <li>
                  <input type="text" name="productName" value={form.productName} onChange={handleChange} placeholder="ชื่อสินค้าใหม่" className="input input-warning w-full bg-white text-black" />
                </li>
                <li>
                  <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="ราคา" className="input input-warning w-full bg-white text-black" min="0" step="0.01" />
                </li>
              </>
            ) : (
              <>
                <li>
                  <select name="productId" value={form.productId} onChange={handleChange} className="select select-warning w-full bg-white text-black">
                    <option value="">-- เลือกสินค้า --</option>
                    {existingProducts.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_id} - {p.product_name}
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
                    className="input input-warning w-full bg-white text-black"
                    readOnly
                  />
                </li>
              </>
            )}
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
            {isNewProduct && (
              <li>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="file-input file-input-warning w-full bg-white focus:border-amber-700 text-gray-500"
                />
              </li>
            )}
            {/* Image Preview */}
            {(form.imageUrl || form.file) && (
              <li className="mt-2">
                <p className="text-sm text-black font-medium">รูปภาพตัวอย่าง:</p>
                <img
                  src={form.file ? URL.createObjectURL(form.file) : form.imageUrl}
                  alt="ตัวอย่าง"
                  className="w-24 h-24 object-contain rounded-md border bg-white mt-1"
                />
              </li>
            )}
            <li>
              <p className="text-gray-500">วันที่จะลงให้อัตโนมัติ</p>
            </li>
            {/* แสดงรายการสินค้าใน tempList */}
            <li className="w-80">
              <div className="text-sm text-black">
                <h3 className="font-bold my-2">รายการรอนำเข้า:</h3>
                <ul className="flex flex-col max-h-40 overflow-y-auto space-y-1 pr-1">
                  {tempList.length === 0 ? (
                    <li className="text-gray-400">ยังไม่มีสินค้าในลิสต์</li>
                  ) : (
                    tempList.map((item, i) => (
                      <li
                        key={i}
                        className="truncate bg-amber-200 rounded pl-2 pr-2 py-1 w-1/2"
                        title={`${item.productName} (จำนวน: ${item.quantity})`}
                      >
                        {i + 1}. {item.productName} ({item.quantity})
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </li>
            <li className="flex gap-5">
              <div className="flex flex-col gap-2 mt-4 w-full">
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
                <button
                  onClick={handleConfirmImport}
                  className="btn btn-success"
                  disabled={tempList.length === 0}
                >
                  ยืนยันการนำเข้า
                </button>
              </div>
            </li>
          </ul>
        </div>

        {/* ตารางแสดงประวัติการนำเข้าสินค้า */}
         <div className="flex-1 p-4 text-black">
          <div className="overflow-x-auto rounded-box border border-black bg-black/5 border-b-2">
          <table className="table w-full bg-white text-black">
            <thead className="text-black">
              <tr>
                <th>รหัสการนำเข้า</th>
                <th>รูปสินค้า</th>
                <th>รหัสสินค้า</th>
                <th>ชื่อสินค้า</th>
                <th>จำนวน</th>
                <th>วันที่</th>
              </tr>
            </thead>
            <tbody>
              {importHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-4">
                    ยังไม่มีสินค้าในตาราง
                  </td>
                </tr>
              ) : (
                <>
                  {currentHistoryItems.map((item) => (
                    <tr key={item.import_id}> {/* Use the unique item ID for the key */}
                      <td className="py-3">{item.batch_id || "-"}</td> {/* Display the shared batch ID */}
                      <td className="py-3">
                        {item.image_path ? (
                          <img
                            src={`http://localhost:5000${item.image_path}`}
                            alt="สินค้า"
                            className="w-10 h-10 object-contain rounded-md"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3">{item.product_id || "-"}</td>
                      <td className="py-3">{item.product_name || "-"}</td>
                      <td className="py-3">{item.quantity !== undefined ? item.quantity : "-"}</td>
                      <td className="py-3">{new Date(item.import_date).toLocaleDateString()}</td>
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
