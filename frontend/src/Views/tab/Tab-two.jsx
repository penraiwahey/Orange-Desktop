// src/pages/ProductsPage.jsx
import { useState } from "react";
import React from "react";

export default function ProductsPage() {
  const [purchaseId, setPurchaseId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [tempList, setTempList] = useState([]); // เก็บข้อมูลที่ลงลิสต์ไว้ก่อน
  const [tableData, setTableData] = useState([]); // เก็บข้อมูลที่อยู่ในตารางจริง

  // กดปุ่ม "ลงลิสต์"
  const handleAddToList = () => {
    if (!purchaseId || !productId || !quantity) return;

    const newItem = {
      purchaseId,
      productId,
      quantity,
      date: new Date().toLocaleDateString("th-TH"),
    };

    setTempList([...tempList, newItem]);

    // ล้าง input
    setPurchaseId("");
    setProductId("");
    setQuantity("");
  };

  // กดปุ่ม "ส่งออกสินค้า" → ย้ายของจาก tempList ลง tableData
  const handleExport = () => {
    setTableData([...tableData, ...tempList]);
    setTempList([]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-black p-4">ส่งออกสินค้า</h1>
      <div className="flex">
        {/* ฟอร์มกรอก */}
        <div className="p-4 min-w-80 max-w-80 border-r border-gray-300">
          <ul className="space-y-2">
            <li>
              <input
                type="text"
                placeholder="รหัสหมายเลขจัดซื้อ"
                className="input input-warning bg-white focus:border-amber-700"
                value={purchaseId}
                onChange={(e) => setPurchaseId(e.target.value)}
              />
            </li>
            <li>
              <input
                type="text"
                placeholder="รหัสสินค้า"
                className="input input-warning bg-white focus:border-amber-700"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            </li>
            <li>
              <input
                type="text"
                placeholder="จำนวน"
                className="input input-warning bg-white focus:border-amber-700"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </li>

            <li>
              <p className="text-gray-500">วันที่จะลงให้อัตโนมัติ</p>
            </li>
            <li className="flex gap-5">
              <button onClick={handleAddToList} className="btn btn-warning mt-40">
                ลงลิสต์
              </button>
              <button onClick={handleExport} className="btn btn-warning mt-40">
                ส่งออกสินค้า
              </button>
            </li>
          </ul>
        </div>

        {/* ตาราง */}
        <div className="flex-1 p-4 text-black">
          <div className="overflow-x-auto rounded-box border border-black bg-black/5 border-b-2">
            <table className="table w-full bg-white text-black">
              <thead className="text-black">
                <tr>
                  <th>หมายเลขจัดซื้อ</th>
                  <th>รูปสินค้า</th>
                  <th>รหัสสินค้า</th>
                  <th>ชื่อสินค้า</th>
                  <th>จำนวน</th>
                  <th>เมื่อวันที่</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.purchaseId}</td>
                    <td>
                      <img
                        src="https://via.placeholder.com/50"
                        alt="สินค้า"
                        className="w-12 h-12 object-contain"
                      />
                    </td>
                    <td>{item.productId}</td>
                    <td>ชื่อสินค้า</td>
                    <td>{item.quantity}</td>
                    <td>{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* แสดงลิสต์ที่ยังไม่ส่งออก */}
          {tempList.length > 0 && (
            <div className="mt-4 p-2 border border-dashed border-amber-500 bg-amber-50 rounded-lg">
              <h2 className="font-semibold text-amber-700">สินค้าที่ลงลิสต์ไว้</h2>
              <ul className="list-disc ml-6">
                {tempList.map((item, index) => (
                  <li key={index}>
                    {item.purchaseId} - {item.productId} - {item.quantity} ชิ้น
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
