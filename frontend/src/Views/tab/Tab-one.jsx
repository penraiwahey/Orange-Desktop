import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function ProductsPage() {
  const [existingProducts, setExistingProducts] = useState([]);
  const [tempList, setTempList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [form, setForm] = useState({
    orderId: "",
    productId: "",
    productName: "",
    quantity: "",
    file: null,
  });

    // ดึงประวัติการนำเข้าสินค้าทั้งหมดจาก DB มาแสดงในตาราง
    useEffect(() => {
      fetch("http://localhost:5000/imports")
        .then(res => res.json())
        .then(data => {
          // console.log("Fetched imports data:", data);
          setTableData(data);
        })
        .catch(err => console.error("Error fetching imports:", err));
    }, []);
// แก้ไขโค้ดใน useEffect
useEffect(() => {
    fetch("http://localhost:5000/products", {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
    })
    .then(data => { // console.log("Fetched products data:", data);
        setExistingProducts(data); // <--- เพิ่มบรรทัดนี้
    })
    .catch((err) => {
        console.error("Error fetching products:", err);
        alert("Failed to load products data. Please check the console for details.");
    });
}, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // เพิ่มเข้า list ชั่วคราว พร้อม SweetAlert2 ตรวจสอบก่อนลงลิสต์
  const handleAddToTempList = async () => {
    if (!form.productId.trim()) {
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "กรุณาใส่รหัสสินค้า",
      });
    }

    // ตรวจสอบว่ารหัสสินค้ามีอยู่แล้วในระบบ
    const exists = existingProducts.find(
      (p) => p.product_id === form.productId.trim()
    );

    // ถ้าเป็นสินค้าคนใหม่ (ไม่พบ) ต้องใส่ชื่อสินค้า
    if (!exists && (!form.productName || !form.productName.trim())) {
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "สำหรับสินค้าคนใหม่ กรุณาใส่ชื่อสินค้า",
      });
    }

    // แสดง SweetAlert2 ยืนยันการลงลิสต์ พร้อมแสดงรายละเอียด
    const result = await Swal.fire({
      title: "คุณต้องการลงลิสต์หรือไม่?",
      html: `<p>รหัสสินค้า: <strong>${form.productId.trim()}</strong></p>
             <p>ชื่อสินค้า: <strong>${exists ? (form.productName.trim() || "-") : form.productName.trim()}</strong></p>
             <p>จำนวน: <strong>${form.quantity}</strong></p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ลงลิสต์",
      cancelButtonText: "ยกเลิก",
    });
    
    if (result.isConfirmed) {
      setTempList((prev) => [...prev, form]);
      setForm({ orderId: "", productId: "", productName: "", quantity: "", file: null });
      Swal.fire({
        icon: "success",
        title: "ลงลิสต์สำเร็จ",
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  // กดยืนยันการยกเลิกลิสต์ โดยใช้ SweetAlert2 เพื่อยืนยันการล้าง tempList
  const handleCancelList = () => {
    Swal.fire({
      title: "คุณต้องการยกเลิกลิสต์หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก"
    }).then((result) => {
      if (result.isConfirmed) {
        setTempList([]);
        Swal.fire({
          icon: "success",
          title: "ยกเลิกลิสต์เรียบร้อยแล้ว",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // เพิ่ม list ชั่วคราวทั้งหมดเข้า table พร้อมส่งข้อมูลไปยัง API
  // หลังจากส่งข้อมูลแล้ว ระบบจะดึงประวัติทั้งหมดจาก API มาแสดงในตาราง
  const handleConfirmAddToTable = async () => {
    const result = await Swal.fire({
      title: "คุณต้องการเพิ่มสินค้าทั้งหมดในลิสต์หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "เพิ่มสินค้า",
      cancelButtonText: "ยกเลิก"
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      // ส่งเป็นครั้งเดียว โดย wrap รายการทั้งหมดลงใน key "items"
      const items = tempList.map(item => ({
        product_id: item.productId.trim(),
        product_name: item.productName ? item.productName.trim() : "",
        quantity: parseInt(item.quantity, 10)
      }));
      
      const response = await fetch("http://localhost:5000/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorData.error,
        });
        return;
      }
  
        const res = await fetch("http://localhost:5000/imports");
        const data = await res.json();
        console.log("Fetched import data:", data);
      setTableData(data);
  
      setTempList([]);
      Swal.fire({
        icon: "success",
        title: "เพิ่มสินค้าเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.message,
      });
    }
  };


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
            <li>
              <input
                type="text"
                name="productId"
                value={form.productId}
                onChange={handleChange}
                placeholder="รหัสสินค้า"
                className="input input-warning w-full bg-white focus:border-amber-700 text-black"
              />
            </li>
            <li>
              <input
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                placeholder="ชื่อสินค้า (สำหรับสินค้าคนใหม่)"
                className="input input-warning w-full bg-white focus:border-amber-700 text-black"
              />
            </li>
            <li>
              <input
                type="text"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="จำนวน"
                className="input input-warning w-full bg-white focus:border-amber-700 text-black"
              />
            </li>
            <li>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="file-input file-input-warning w-full bg-white focus:border-amber-700 text-gray-500"
              />
            </li>
            <li>
              <p className="text-gray-500">วันที่จะลงให้อัตโนมัติ</p>
            </li>
            {/* แสดงรายการสินค้าใน tempList */}
            <li className="w-80">
              <div className="text-sm text-black">
                <ul className="flex max-h-40 overflow-y-auto space-y-1 pr-1">
                  {tempList.length === 0 ? (
                    <li className="text-gray-400">ยังไม่มีสินค้าในลิสต์</li>
                  ) : (
                    tempList.map((item, i) => (
                      <li
                        key={i}
                        className="truncate bg-amber-500 rounded pl-2 pr-2 py-1"
                        title={`${item.productName} (${item.quantity})`}
                      >
                        {item.productName} ({item.quantity})
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </li>
            <li className="flex gap-5">
              <div className="flex gap-2 mt-20">
                <button
                  onClick={handleAddToTempList}
                  className="btn btn-outline btn-warning"
                >
                  ลงลิสต์
                </button>
                <button
                  onClick={handleCancelList}
                  className="btn btn-error"
                >
                  ยกเลิกลิสต์
                </button>
              </div>
              <button
                onClick={handleConfirmAddToTable}
                className="btn btn-warning mt-20"
                disabled={tempList.length === 0}
              >
                เพิ่มสินค้า
              </button>
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
              {tableData && tableData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-4">
                    ยังไม่มีสินค้าในตาราง
                  </td>
                </tr>
              ) : (
                tableData && Array.isArray(tableData) && tableData.map((item, i) => (
                  <tr key={item.import_id || i}>
                    <td className="py-3">{item.import_id || "-"}</td>
                    <td className="py-3">
                      {item.file ? (
                        <img
                          src={URL.createObjectURL(item.file)}
                          alt="สินค้า"
                          className="w-10 h-10 object-contain rounded-md"
                        />
                      ) : (
                        <img
                          src={existingProducts.find(p => p.product_id === item.product_id)?.image_path || ""}
                          alt="รูปสินค้า"
                          className="w-10 h-10 object-contain rounded-md"
                        />
                      )}
                    </td>
                    <td className="py-3">{item.product_id || "-"}</td>
                    <td className="py-3">{item.product_name || "-"}</td>
                    <td className="py-3">{item.quantity !== undefined ? item.quantity : "-"}</td>
                    <td className="py-3">{new Date(item.import_date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
