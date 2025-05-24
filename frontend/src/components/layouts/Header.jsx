import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem(ACCESS_TOKEN));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Hàm cập nhật số lượng sản phẩm trong giỏ từ API
    const updateCartCount = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        setCartCount(0);
        return;
      }

      try {
        const response = await api.get("/api/cart/");
        const data = response.data;
        const total = (data.items || []).reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );
        setCartCount(total);
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        setCartCount(0);
      }
    };

    updateCartCount();

    // Lắng nghe sự thay đổi khi quay lại trang
    window.addEventListener("focus", updateCartCount);

    // Tạo event listener tùy chỉnh để cập nhật cart count
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("focus", updateCartCount);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [isLoggedIn]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.clear();
    setCartCount(0);
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
