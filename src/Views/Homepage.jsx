import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from '../assets/Logo.png';

export default function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    "รับสินค้า",
    "ส่งสินค้า",
    "ดูรหัสสินค้า",
  ];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sessionExpires");
    navigate("/"); // กลับไป LoginPage
  };

  const [activeMenu, setActiveMenu] = useState(null);


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col items-center justify-center bg-yellow-500 w-20 p-2 text-white">
        <div className="flex flex-col items-center justify-center h-12 w-12 mb-4">
          <img
            src={Logo}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <button className="mb-2">🏠</button>
        <button className="mb-2">ℹ️</button>
        <button className="mb-2">📦</button>
        <button onClick={handleLogout} className="mt-auto text-red-500">
          Logout
        </button>
      </div>

      {/* Main content */}
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
  {/* ด้านซ้าย: เมนู */}
  <div className="w-full md:w-1/3 p-4">
    <ul className="menu bg-white text-base-content w-1/3 md:w-80 p-4">
      <li className="pb-4">
        <button className="btn btn-outline btn-warning w-full" onClick={() => setActiveMenu("receipt")}>
          Receipt of Purchase Order
        </button>
      </li>
      <li className="pb-4">
        <button className="btn btn-outline btn-warning w-full" onClick={() => setActiveMenu("packing")}>
          Purchase Order Packing Receipt
        </button>
      </li>
      <li className="pb-4">
        <button className="btn btn-outline btn-warning w-full" onClick={() => setActiveMenu("transfer")}>
          Transfer Order Receipt
        </button>
      </li>
      <li className="pb-4">
        <button className="btn btn-outline btn-warning w-full" onClick={() => setActiveMenu("other")}>
          Other Receipt
        </button>
      </li>
      <li className="pb-4">
        <button className="btn btn-outline btn-warning w-full" onClick={() => setActiveMenu("packingReceiving")}>
          Packing / Receiving
        </button>
      </li>
    </ul>
  </div>

    <div class="w-1/3">

    </div>

  {/* ด้านขวา: เนื้อหา */}
  <div className="w-full md:w-2/3 p-4 text-black">
    {activeMenu === "receipt" && (
      <div>
        <h2 className="text-xl font-semibold">Receipt of Purchase Order</h2>
        <p>รายละเอียดสำหรับหน้า Receipt...</p>
      </div>
    )}
    {activeMenu === "packing" && (
      <div>
        <h2 className="text-xl font-semibold">Purchase Order Packing Receipt</h2>
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
        <h2 className="text-xl font-semibold">Purchase Order Packing Receipt</h2>
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
