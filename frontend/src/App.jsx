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
import SelectGroup from "./pages/SelectGroup";
import CreateGroup from "./pages/CreateGroup";

const Empty = ({ name }) => (
  <div className="p-4 text-xl font-medium">Trang: {name}</div>
);

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

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
          <Route
            path="/login"
            element={<Login onLogin={() => setIsLoggedIn(true)} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/select-group" element={<SelectGroup />} />{" "}
          {/* 👈 THÊM DÒNG NÀY */}
          <Route
            path="*"
            element={<Login onLogin={() => setIsLoggedIn(true)} />}
          />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4">
        <div className="flex justify-end gap-4 mb-4">
          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              setIsLoggedIn(false);
              navigate("/login");
            }}
            className="text-sm text-red-600 font-medium hover:underline"
          >
            Đăng xuất
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/select-group" element={<SelectGroup />} />
          <Route path="/create-group" element={<CreateGroup />} />
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
