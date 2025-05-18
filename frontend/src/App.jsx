import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from "./components/layouts/sidebar";
import Dashboard from "./pages/dashboard";
import ShoppingList from "./pages/shoppingList";
import Store from "./pages/store";
import Fridge from "./pages/fridge";
import Recipes from "./pages/recipes";
import Plans from "./pages/plan";
import Statistics from "./pages/statistics";
import Profile from "./pages/Profile";
import Logout from "./components/Logout";

const Empty = ({ name }) => (
  <div className="p-4 text-xl font-medium">Trang: {name}</div>
);

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi component được mount
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userData = localStorage.getItem("user");

    setIsLoggedIn(loggedIn);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  // Nếu chưa đăng nhập và cố gắng truy cập các trang khác login/register => redirect về /login
  useEffect(() => {
    const publicPaths = ["/login", "/register"];
    if (!isLoggedIn && !publicPaths.includes(location.pathname)) {
      navigate("/login");
    }
  }, [isLoggedIn, location.pathname, navigate]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4">
        <div className="flex justify-end gap-4 mb-4">
          <Logout onLogout={handleLogout} />
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shopping" element={<ShoppingList />} />
          <Route path="/store" element={<Store />} />
          <Route path="/fridge" element={<Fridge />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/stats" element={<Statistics />} />
          <Route path="/settings" element={<Empty name="Cài Đặt" />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
