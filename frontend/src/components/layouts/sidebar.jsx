import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import Header from "./Header";

const NavItem = ({ to, icon, label, badge }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        isActive
          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
          : "text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-md hover:scale-102"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-xl transition-all duration-300 ${
            isActive ? "scale-110" : "group-hover:scale-110"
          }`}
        >
          {icon}
        </span>
        <span
          className={`font-medium transition-all duration-300 ${
            isActive ? "font-semibold" : ""
          }`}
        >
          {label}
        </span>
      </div>

      {badge && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}

      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      )}
    </Link>
  );
};

const Sidebar = () => {
  const menuItems = [
    { to: "/", icon: "🏠", label: "Trang Chủ" },
    {
      to: "/shopping-list",
      icon: "🛍️",
      label: "Danh Sách Mua Sắm",
    },
    { to: "/store", icon: "🏪", label: "Cửa Hàng Thực Phẩm" },
    { to: "/fridge", icon: "❄️", label: "Quản Lý Tủ Lạnh" },
    { to: "/recipes", icon: "👨‍🍳", label: "Công Thức Nấu Ăn" },
    { to: "/meal-planning", icon: "📅", label: "Lập Kế Hoạch Bữa Ăn" },
    { to: "/statistics", icon: "📊", label: "Thống Kê" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header spanning full width */}
      <Header />

      {/* Sidebar and Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-72 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 flex flex-col">
          {/* Navigation */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 px-4 mb-4">
                <div className="w-6 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Chức Năng Chính
                </span>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <NavItem to="/profile" icon="👤" label="Hồ Sơ Cá Nhân" />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
