import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("access"));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Hàm cập nhật số lượng sản phẩm trong giỏ
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };
    updateCartCount();
    // Lắng nghe sự thay đổi của localStorage (khi ở nhiều tab)
    window.addEventListener("storage", updateCartCount);
    // Lắng nghe sự thay đổi khi quay lại trang
    window.addEventListener("focus", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("focus", updateCartCount);
    };
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-white shadow-md">
      <div className="text-2xl font-bold text-green-700 flex items-center gap-2">
        🛒 Smart Meal
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded hover:bg-green-100 transition">
          <span className="material-icons text-xl">notifications</span>
        </button>
        <button
          className="relative p-2 rounded hover:bg-green-100 transition"
          onClick={() => navigate("/cart")}
        >
          <span className="material-icons text-xl">shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        {isLoggedIn ? (
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={handleLogin}
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
