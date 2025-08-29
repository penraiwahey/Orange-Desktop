// src/pages/ProductsPage.jsx
import { useState } from "react";
import React from "react";
import Receipt from "../other/Receipt";
import Packing from "../other/Packing";
import Transfer from "../other/Transfer";
import OtherReceipt from "../other/OtherReceipt";
import PackingReceiving from "../other/PackingReceiving";

export default function ProductsPage() {
  const [activeMenu, setActiveMenu] = useState("receipt");

  return (
    <div className="flex">
      {/* Sidebar Menu */}
      <div className="p-4 min-w-80">
        <ul className="menu bg-white text-base-content p-4">
          <li className="pb-4">
            <button
              className="btn btn-outline btn-warning w-full"
              onClick={() => setActiveMenu("receipt")}
            >
              ใบเสร็จรับเงินใบสั่งซื้อ
            </button>
          </li>
          <li className="pb-4">
            <button
              className="btn btn-outline btn-warning w-full"
              onClick={() => setActiveMenu("packing")}
            >
              ใบเสร็จรับเงินบรรจุภัณฑ์ใบสั่งซื้อ
            </button>
          </li>
          <li className="pb-4">
            <button
              className="btn btn-outline btn-warning w-full"
              onClick={() => setActiveMenu("transfer")}
            >
              ใบเสร็จรับเงินโอน
            </button>
          </li>
          <li className="pb-4">
            <button
              className="btn btn-outline btn-warning w-full"
              onClick={() => setActiveMenu("other")}
            >
              ใบเสร็จรับเงินอื่น ๆ
            </button>
          </li>
          <li className="pb-4">
            <button
              className="btn btn-outline btn-warning w-full"
              onClick={() => setActiveMenu("packingReceiving")}
            >
              ใบเสร็จรับเงินบรรจุภัณฑ์ / รับสินค้า
            </button>
          </li>
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 text-black">
        {activeMenu === "receipt" && <Receipt />}
        {activeMenu === "packing" && <Packing />}
        {activeMenu === "transfer" && <Transfer />}
        {activeMenu === "other" && <OtherReceipt />}
        {activeMenu === "packingReceiving" && <PackingReceiving />}
      </div>
    </div>
  );
}
