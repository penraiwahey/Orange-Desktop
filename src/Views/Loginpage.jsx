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
      console.log("Session found, redirecting...");
      navigate("/home"); // ✅ ใช้ navigate
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
        console.log("Redirect to Home...");
        navigate("/home"); // ✅ ไม่ต้องใช้ window.location
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
    <div className="flex h-screen bg-gray-100">
      {/* Left panel */}
      <div className="hidden md:flex bg-amber-500 w-1/3 flex-col items-center justify-center p-8 text-white">
        <div className="text-center mb-8">
          <p className="text-3xl font-bold leading-relaxed">
            คำอธิบายหรือข้อความต้อนรับ<br />เว็บไซต์ Ecommerce
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-white">
        <div className="flex justify-between w-full max-w-md mb-6">
          <h1 className="text-4xl font-bold">Login</h1>
          <select className="select select-warning w-28">
            <option>ไทย</option>
            <option>อังกฤษ</option>
          </select>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col w-full max-w-md gap-4">
          <input
            type="email"
            placeholder="Email address"
            className="input input-bordered w-full rounded-lg px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input input-bordered w-full rounded-lg px-4 py-3 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-600 hover:text-gray-800"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-warning mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#" className="text-orange-500 hover:underline text-sm">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="btn bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors duration-200"
          >
            Login
          </button>
          <p className="text-center text-gray-600">
            Don't have an account?{" "}
            <a href="#" className="text-orange-500 hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
