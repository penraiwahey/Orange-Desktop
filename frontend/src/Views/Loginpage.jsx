import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedSession = localStorage.getItem("isLoggedIn");
    const sessionExpiration = localStorage.getItem("sessionExpires");

    if (storedSession && new Date() < new Date(sessionExpiration)) {
      navigate("/home");
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-orange-200 via-yellow-100 to-amber-200">
      {/* Left panel */}
      <div className="hidden md:flex bg-amber-600 w-1/3 flex-col items-center justify-center p-12 text-white shadow-lg">
        <h2 className="text-4xl font-extrabold mb-6 drop-shadow-lg">
          ยินดีต้อนรับสู่ Ecommerce
        </h2>
        <p className="text-lg leading-relaxed max-w-sm text-amber-100">
          พบประสบการณ์ช้อปปิ้งที่ดีที่สุดกับเรา สินค้าหลากหลาย ราคาถูกใจ
          พร้อมโปรโมชั่นมากมายรอคุณอยู่
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-4">
        <LoginForm />
      </div>
    </div>
  );
}
