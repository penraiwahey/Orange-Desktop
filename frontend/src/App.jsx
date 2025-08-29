import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./Views/Loginpage.jsx";
import HomePage from "./Views/Homepage.jsx";
import MainWindow from "./pages/MainWindow.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* หน้าแรกเป็น Login */}
        <Route path="/" element={<LoginPage />} />
        
        {/* หน้า Home */}
        <Route path="/home" element={<HomePage />} />
        
        {/* หน้า MainWindow */}
        <Route path="/main_window" element={<MainWindow />} />
        
        {/* fallback ถ้าไม่เจอ route */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}
