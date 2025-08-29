import React from "react";


export default function Receipt() {
  return (
<div>
        <h2 className="text-xl font-semibold mb-4 text-black">
            การบรรจุและการรับสินค้า
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
  );
}


