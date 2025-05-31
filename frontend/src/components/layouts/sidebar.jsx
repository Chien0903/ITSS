import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import Header from "./Header";

const NavItem = ({ to, icon, label }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 ${
        isActive ? "bg-green-100 font-medium" : ""
      }`}
    >
      <span className="text-lg">{icon}</span> {label}
    </Link>
  );
};

const Sidebar = () => (
  <div className="flex h-screen">
    <div className="w-64 bg-green-50 text-gray-800 p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2">
          🛒 Smart Meal
        </h1>
        <div className="text-sm text-gray-500 mb-2">Chức Năng Chính</div>
        <nav className="flex flex-col gap-1">
          <NavItem to="/" icon="🏠" label="Trang Chủ" />
          <NavItem to="/shopping-list" icon="🛍️" label="Danh Sách Mua Sắm" />
          <NavItem to="/store" icon="🧺" label="Cửa Hàng Thực Phẩm" />
          <NavItem to="/fridge" icon="🧊" label="Quản Lý Tủ Lạnh" />
          <NavItem to="/recipes" icon="📋" label="Công Thức Nấu Ăn" />
          <NavItem to="/meal-planning" icon="🗓️" label="Lập Kế Hoạch Bữa Ăn" />
          <NavItem to="/statistics" icon="📊" label="Thống Kê" />
        </nav>
      </div>
      <div className="flex flex-col gap-1 border-t pt-4 mt-4">
        <NavItem to="/profile" icon="��" label="Hồ Sơ" />
      </div>
    </div>
    <div className="flex-1 flex flex-col h-full">
      <Header />
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  </div>
);

export default Sidebar;
