import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import ProductsPage from "./tab/Tab-one"; // นำเข้ามา
import ExportPage from "./tab/Tab-two";
import IdPage from "./tab/Tab-three";

export default function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["นำเข้าสินค้า", "ส่งออกสินค้า", "สต็อคสินค้า"];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sessionExpires");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col items-center justify-center bg-warning w-20 p-2 text-white">
        <div className="flex flex-col items-center justify-center h-14 w-14 mb-4 bg-warning rounded-full border-2 border-white">
          <img src={Logo} alt="Logo" className="w-12 h-12 object-contain bg-white rounded-full" />
        </div>
        {/* <button className="mb-2">🏠</button>
        <button className="mb-2">ℹ️</button>
        <button className="mb-2">📦</button> */}
        <button onClick={handleLogout} class="btn btn-soft btn-error mt-auto">
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

          {/* Content ของ tab */}
          <div className="w-full h-full">
            {activeTab === 0 && <ProductsPage />} {/* หน้า tab สินค้า */}
            {activeTab === 1 && <ExportPage />}
            {activeTab === 2 && <IdPage />}
          </div>
        </div>
      </div>
    </div>
  );
}
