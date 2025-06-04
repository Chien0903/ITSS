import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layouts/sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import ShoppingList from "./pages/shoppingList";
import Store from "./pages/store";
import Fridge from "./pages/fridge";
import Recipes from "./pages/recipes";
import Plans from "./pages/plan";
import Statistics from "./pages/statistics";
import Profile from "./pages/Profile";
import SelectGroup from "./pages/SelectGroup";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AddShoppingList from "./pages/addShoppingList";
import ShoppingListDetail from "./pages/ShoppingListDetail";
import AddNewPlanning from "./pages/AddNewPlanning";
import ProtectedRoute from "./protectedRoute";
import AccountManagement from "./pages/accountManagement";
import DataManagement from "./pages/dataManagement";

// Component kiểm tra quyền admin
const AdminRoute = ({ children }) => {
  const isAdmin = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        return userData.role === "admin";
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
    return false;
  };

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Sidebar />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="account-management"
          element={
            <AdminRoute>
              <AccountManagement />
            </AdminRoute>
          }
        />
        <Route path="shopping-list" element={<ShoppingList />} />
        <Route path="store" element={<Store />} />
        <Route path="fridge" element={<Fridge />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="meal-planning" element={<Plans />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="add-shopping-list" element={<AddShoppingList />} />
        <Route path="shopping-list/:id" element={<ShoppingListDetail />} />
        <Route path="add-new-planning" element={<AddNewPlanning />} />
        <Route path="profile" element={<Profile />} />
        <Route path="data-management" element={<DataManagement />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/select-group" element={<SelectGroup />} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
}

export default App;
