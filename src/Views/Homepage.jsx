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

          {/* Table content */}
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full text-black">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-4 py-2"></th>
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">Job</th>
                    <th className="border px-4 py-2">Favorite Color</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="border px-4 py-2">1</th>
                    <td className="border px-4 py-2">Cy Ganderton</td>
                    <td className="border px-4 py-2">Quality Control Specialist</td>
                    <td className="border px-4 py-2">Blue</td>
                  </tr>
                  <tr>
                    <th className="border px-4 py-2">2</th>
                    <td className="border px-4 py-2">Hart Hagerty</td>
                    <td className="border px-4 py-2">Desktop Support Technician</td>
                    <td className="border px-4 py-2">Purple</td>
                  </tr>
                  <tr>
                    <th className="border px-4 py-2">3</th>
                    <td className="border px-4 py-2">Brice Swyre</td>
                    <td className="border px-4 py-2">Tax Accountant</td>
                    <td className="border px-4 py-2">Red</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
