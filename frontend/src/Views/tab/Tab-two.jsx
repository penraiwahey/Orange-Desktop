// src/pages/ExportPage.jsx
import React, { useState } from "react";

export default function ExportPage() {
  const [tempList, setTempList] = useState([]); // เก็บสินค้าชั่วคราว
  const [tableData, setTableData] = useState([]); // เก็บสินค้าที่เพิ่มเข้าตารางแล้ว
  const [form, setForm] = useState({
    orderId: "",
    productId: "",
    productName: "",
    quantity: "",
    file: null,
    address: ""
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // เพิ่มเข้า list ชั่วคราว
  const handleAddToTempList = () => {
    if (!form.productName) return;
    setTempList((prev) => [...prev, form]);
    setForm((prev) => ({
      ...prev,
      orderId: "",
      productId: "",
      productName: "",
      quantity: "",
      file: null,
    }));
  };

  // เพิ่ม list ชั่วคราวทั้งหมดเข้า table
  const handleConfirmAddToTable = () => {
    setTableData((prev) => [...prev, ...tempList]);
    setTempList([]); // เคลียร์ลิสต์หลังเพิ่มเสร็จ
  };

  // ส่งข้อมูลสินค้าไปยัง API Export
  const handleSubmitExport = async () => {
    if (!form.address) {
      alert("กรุณาใส่ที่อยู่จัดส่ง");
      return;
    }
    if (tableData.length === 0) {
      alert("ไม่มีสินค้าในรายการส่งออก");
      return;
    }

    // เตรียมข้อมูล items ตามที่ API คาดหวัง
    const items = tableData.map(item => ({
      product_id: item.productId,
      quantity: parseInt(item.quantity, 10)
    }));

    try {
      const response = await fetch("http://localhost:5000/exports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          address: form.address,
          items: items
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Error: " + errorData.error);
        return;
      }

      const data = await response.json();
      alert(`Export successful. Export ID: ${data.export_id}`);
      setTableData([]); // เคลียร์รายการหลังส่งออก
      setForm((prev) => ({ ...prev, address: "" })); // เคลียร์ที่อยู่ด้วย
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-black p-4">ส่งออกสินค้า</h1>
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
                placeholder="รหัสหมายเลขจัดส่ง"
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
                placeholder="ชื่อสินค้า"
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
              <textarea 
                name="address"
                value={form.address} 
                onChange={handleChange}
                placeholder="ที่อยู่จัดส่ง / ผู้รับ" 
                className="textarea textarea-warning bg-white text-black"
              ></textarea>
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
              <div className="flex gap-2 mt-10">
                <button
                  onClick={handleAddToTempList}
                  className="btn btn-outline btn-warning"
                >
                  ลงลิสต์
                </button>
                <button
                  onClick={() => setTempList([])}
                  className="btn btn-error"
                >
                  ยกเลิกลิสต์
                </button>
              </div>
              <button
                onClick={handleConfirmAddToTable}
                className="btn btn-warning mt-10"
                disabled={tempList.length === 0}
              >
                เพิ่มสินค้า
              </button>
            </li>
          </ul>
        </div>
        {/* ตารางแสดงรายการสินค้า */}
        <div className="flex-1 p-4 text-black">
          <div className="overflow-x-auto rounded-box border border-black bg-black/5 border-b-2">
            <table className="table w-full bg-white text-black">
              <thead className="text-black">
                <tr>
                  <th>หมายเลขจัดส่ง</th>
                  <th>รูปสินค้า</th>
                  <th>รหัสสินค้า</th>
                  <th>ชื่อสินค้า</th>
                  <th>จำนวน</th>
                  <th>วันที่</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400">
                      ยังไม่มีสินค้าในตาราง
                    </td>
                  </tr>
                ) : (
                  tableData.map((item, i) => (
                    <tr key={i}>
                      <td>{item.orderId || "-"}</td>
                      <td>
                        {item.file ? (
                          <img
                            src={URL.createObjectURL(item.file)}
                            alt="สินค้า"
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{item.productId || "-"}</td>
                      <td>{item.productName}</td>
                      <td>{item.quantity || "-"}</td>
                      <td>{new Date().toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* ปุ่มส่งออกสินค้า */}
          <div className="mt-4">
            <button
              onClick={handleSubmitExport}
              className="btn btn-success"
              disabled={tableData.length === 0 || !form.address}
            >
              ส่งออกสินค้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
