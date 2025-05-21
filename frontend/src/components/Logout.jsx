import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem("user");

    // Gọi callback để cập nhật trạng thái từ App.jsx
    if (onLogout) onLogout();

    // Chuyển hướng về trang đăng nhập
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-500 hover:text-red-700 font-medium"
    >
      Đăng xuất
    </button>
  );
};

export default Logout;
