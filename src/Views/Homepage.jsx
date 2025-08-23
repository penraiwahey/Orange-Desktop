import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from '../assets/Logo.png';
export default function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    "รับสินค้า",
  ];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sessionExpires");
    navigate("/"); // กลับไป LoginPage
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col items-center justify-center bg-orange-500 w-20 p-2 text-white">
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

            <div>
              <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
              <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                <li><button class="btn btn-outline btn-warning">Receipt of Purchase Order</button></li>
                <li><button class="btn btn-outline btn-warning">Purchase Order Packing Receipt</button></li>
                <li><button class="btn btn-outline btn-warning">Transfer Order Receipt</button></li>
                <li><button class="btn btn-outline btn-warning">Other Receipt</button></li>
                <li><button class="btn btn-outline btn-warning">Packing / Receiving</button></li>
                
              </ul>
            </div>
          </div>
         
            </div>
          </div>
  );
}
