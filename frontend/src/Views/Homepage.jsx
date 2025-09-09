import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import ProductsPage from "./tab/Tab-one"; // หน้า tab สินค้า
import ExportPage from "./tab/Tab-two";
import IdPage from "./tab/Tab-three";

export default function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["นำเข้าสินค้า", "ส่งออกสินค้า", "สต็อกสินค้า"];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sessionExpires");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col items-center bg-warning w-20 p-2 text-white">
        <div className="flex flex-col items-center justify-center h-14 w-14 mb-4 bg-warning rounded-full border-2 border-white">
          <img
            src={Logo}
            alt="Logo"
            className="w-12 h-12 object-contain bg-white rounded-full"
          />
        </div>
        <button onClick={handleLogout} className="btn btn-soft btn-error absolute bottom-0">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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

        {/* Tab Content */}
        <div className="flex-1 overflow-auto bg-white">
          {activeTab === 0 && <ProductsPage />}
          {activeTab === 1 && <ExportPage />}
          {activeTab === 2 && <IdPage />}
        </div>
      </div>
    </div>
  );
}
