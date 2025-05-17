import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layouts/sidebar";
import Dashboard from  "./pages/dashboard"
import ShoppingList from "./pages/shoppingList";
import Store from "./pages/store";
import Fridge from "./pages/fridge";
import Recipes from "./pages/recipes";
import Plans from "./pages/plan";
import Statistics from "./pages/statistics";

const Empty = ({ name }) => (
  <div className="p-4 text-xl font-medium">Trang: {name}</div>
);

const App = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shopping" element={<ShoppingList />} />
          <Route path="/store" element={<Store />} />
          <Route path="/fridge" element={<Fridge />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/stats" element={<Statistics />} />
          <Route path="/settings" element={<Empty name="Cài Đặt" />} />
          <Route path="/profile" element={<Empty name="Hồ Sơ" />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
