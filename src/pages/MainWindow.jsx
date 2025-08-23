import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MainWindow() {
  const navigate = useNavigate();

  useEffect(() => {
    // สมมุติว่าต้อง check ว่า login หรือยัง
    const isLoggedIn = false; // <-- ท่านเปลี่ยนตาม logic จริง เช่น localStorage, context

    if (!isLoggedIn) {
      navigate("/"); // วาร์ปกลับไป LoginPage
    }
  }, [navigate]);

  return (
    <div>
      <h1>Main Window</h1>
      <button onClick={() => navigate("/")}>ออกจากระบบ</button>
    </div>
  );
}
