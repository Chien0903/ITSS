import React from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // 👉 Giả lập đăng nhập thành công
    localStorage.setItem("isLoggedIn", "true");
    if (onLogin) onLogin(); // Gọi callback cập nhật trạng thái từ App.jsx
    navigate("/"); // Chuyển hướng về trang chủ
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng Nhập</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full px-4 py-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Đăng Nhập
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-green-500 hover:underline">
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
