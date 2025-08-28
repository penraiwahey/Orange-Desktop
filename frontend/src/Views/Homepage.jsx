import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";

export default function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [activeMenu, setActiveMenu] = useState(null);

  const tabs = ["รับสินค้า", "ส่งสินค้า", "ดูรหัสสินค้า"];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sessionExpires");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col items-center justify-center bg-yellow-500 w-20 p-2 text-white">
        <div className="flex flex-col items-center justify-center h-12 w-12 mb-4">
          <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <button className="mb-2">🏠</button>
        <button className="mb-2">ℹ️</button>
        <button className="mb-2">📦</button>
        <button onClick={handleLogout} className="mt-auto text-red-500">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 mx-auto w-full h-screen overflow-auto">
        <div className="bg-white h-full">
          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            {tabs.map((tab, index) => (
              <div
                key={index}
                onClick={() => setActiveTab(index)}
                className="cursor-pointer px-4 py-2 relative"
              >
                <span
                  className={
                    activeTab === index
                      ? "text-orange-500 font-semibold"
                      : "text-black"
                  }
                >
                  {tab}
                </span>
                {activeTab === index && (
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-orange-500" />
                )}
              </div>
            ))}
          </div>

          <div className="flex w-full justify-center">
            {/* Left menu */}
            <div className="w-full md:w-1/3 p-4">
              <ul className="menu bg-white text-base-content w-1/3 md:w-80 p-4">
                <li className="pb-4">
                  <button
                    className="btn btn-outline btn-warning w-full"
                    onClick={() => setActiveMenu("receipt")}
                  >
                    Receipt of Purchase Order
                  </button>
                </li>
                <li className="pb-4">
                  <button
                    className="btn btn-outline btn-warning w-full"
                    onClick={() => setActiveMenu("packing")}
                  >
                    Purchase Order Packing Receipt
                  </button>
                </li>
                <li className="pb-4">
                  <button
                    className="btn btn-outline btn-warning w-full"
                    onClick={() => setActiveMenu("transfer")}
                  >
                    Transfer Order Receipt
                  </button>
                </li>
                <li className="pb-4">
                  <button
                    className="btn btn-outline btn-warning w-full"
                    onClick={() => setActiveMenu("other")}
                  >
                    Other Receipt
                  </button>
                </li>
                <li className="pb-4">
                  <button
                    className="btn btn-outline btn-warning w-full"
                    onClick={() => setActiveMenu("packingReceiving")}
                  >
                    Packing / Receiving
                  </button>
                </li>
              </ul>
            </div>

            <div className="w-1/3" />

            {/* Right content */}
            <div className="w-full md:w-2/3 p-4 text-black">
              {activeMenu === "receipt" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Receipt of Purchase Order
                  </h2>

                  <form className="space-y-4 bg-gray-100 p-6 rounded-md shadow-md">
                    <div>
                      <label className="block text-gray-700">
                        หมายเลขใบจัดซื้อ
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="ใส่เลขที่ใบจัดซื้อ"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700">ซัพพลายเออร์</label>
                      <select className="w-full p-2 border rounded">
                        <option>เลือกซัพพลายเออร์</option>
                        <option>ซัพพลายเออร์ A</option>
                        <option>ซัพพลายเออร์ B</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700">รหัสสินค้า</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="ใส่รหัสสินค้า"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700">หมายเลขกำกับ</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="ใส่หมายเลขกำกับ"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700">วันที่ผลิต</label>
                      <input type="date" className="w-full p-2 border rounded" />
                    </div>

                    <div>
                      <label className="block text-gray-700">จำนวน</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="ป้อนจำนวน"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        ยืนยันเข้าคลัง
                      </button>
                    </div>
                  </form>
                  {/* ข้อมูลสินค้า + ตาราง */}
<div className="mt-8">
  <h3 className="text-lg font-semibold mb-2">รายการสินค้า</h3>

  <table className="min-w-full bg-white border border-gray-300 text-sm">
    <thead className="bg-gray-200 text-gray-700">
      <tr>
        <th className="border px-2 py-1">รูปภาพ</th>
        <th className="border px-2 py-1">ข้อมูลสินค้า</th>
        <th className="border px-2 py-1">จำนวนการจัดซื้อ</th>
        <th className="border px-2 py-1">จำนวนที่เข้าคลัง</th>
        <th className="border px-2 py-1">หมายเลขกำกับ</th>
        <th className="border px-2 py-1">วันที่ผลิต</th>
        <th className="border px-2 py-1">วันหมดอายุ</th>
        <th className="border px-2 py-1">หมายเหตุ</th>
        <th className="border px-2 py-1">สถานะ</th>
        <th className="border px-2 py-1">น้ำหนัก</th>
        <th className="border px-2 py-1">หน่วยของน้ำหนัก</th>
        <th className="border px-2 py-1">แก้ไข</th>
      </tr>
    </thead>
    <tbody>
      {/* ตัวอย่างแถวเดียว (สามารถทำ map รายการได้ทีหลัง) */}
      <tr>
        <td className="border px-2 py-1">
          <img
            src="https://via.placeholder.com/50"
            alt="product"
            className="w-12 h-12 object-cover"
          />
        </td>
        <td className="border px-2 py-1">
          <div>รหัส: 12345</div>
          <div>ชื่อ: สินค้าตัวอย่าง</div>
        </td>
        <td className="border px-2 py-1 text-center">100</td>
        <td className="border px-2 py-1 text-center">0</td>
        <td className="border px-2 py-1 text-center">-</td>
        <td className="border px-2 py-1 text-center">-</td>
        <td className="border px-2 py-1 text-center">-</td>
        <td className="border px-2 py-1 text-center">-</td>
        <td className="border px-2 py-1 text-center text-yellow-600">รอรับ</td>
        <td className="border px-2 py-1 text-center">1.2</td>
        <td className="border px-2 py-1 text-center">กิโลกรัม</td>
        <td className="border px-2 py-1 text-center">
          <button className="text-blue-500 hover:underline">แก้ไข</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

                </div>
              )}

              {activeMenu === "packing" && (
                <div>
                  <h2 className="text-xl font-semibold">
                    Purchase Order Packing Receipt
                  </h2>
                  <p>รายละเอียดสำหรับ Packing Receipt...</p>
                </div>
              )}

              {activeMenu === "transfer" && (
                <div>
                  <h2 className="text-xl font-semibold">Transfer Order Receipt</h2>
                  <p>รายละเอียดสำหรับ Transfer Order...</p>
                </div>
              )}

              {activeMenu === "other" && (
                <div>
                  <h2 className="text-xl font-semibold">Other Receipt</h2>
                  <p>รายละเอียดสำหรับ Other Receipt...</p>
                </div>
              )}

              {activeMenu === "packingReceiving" && (
                <div>
                  <h2 className="text-xl font-semibold">Packing / Receiving</h2>
                  <p>รายละเอียดสำหรับ Packing / Receiving...</p>
                </div>
              )}

              {!activeMenu && (
                <div>
                  <h2 className="text-xl font-semibold">
                    Purchase Order Packing Receipt
                  </h2>
                  <p>รายละเอียดสำหรับ Packing Receipt...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
