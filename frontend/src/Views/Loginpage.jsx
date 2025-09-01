import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSession = localStorage.getItem("isLoggedIn");
    const sessionExpiration = localStorage.getItem("sessionExpires");

    if (storedSession && new Date() < new Date(sessionExpiration)) {
      navigate("/home");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "E@E.EE" && password === "Ka74000") {
      Swal.fire({
        title: "สำเร็จ!",
        text: "คุณเข้าสู่ระบบเรียบร้อยแล้ว",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        if (rememberMe) {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 30);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("sessionExpires", expirationDate.toISOString());
        }
        navigate("/home");
      });
    } else {
      Swal.fire({
        title: "ข้อผิดพลาด!",
        text: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        icon: "error",
        confirmButtonText: "ลองอีกครั้ง",
      });
    }
  };

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
        <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold text-amber-600">Login</h1>
            <select className="select select-warning w-24 text-white bg-amber-600 rounded-md shadow-md">
              <option>ไทย</option>
              <option>อังกฤษ</option>
            </select>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <input
              type="email"
              placeholder="Email address"
              className="rounded-xl px-5 py-3 bg-white text-black border-amber-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-xl px-5 py-3 pr-12 bg-white text-black border-amber-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-amber-400 hover:text-amber-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="flex justify-between items-center text-gray-700">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="checkbox checkbox-warning mr-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-amber-600 hover:text-amber-800 underline text-sm"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
            >
              Login
            </button>

            <p className="text-center text-gray-500">
              Don't have an account?{" "}
              <a
                href="#"
                className="text-amber-500 hover:text-amber-700 font-semibold underline"
              >
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
