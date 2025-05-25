// Store.jsx - đã cập nhật thêm 2 nút + routing + responsive cho admin

import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus } from "lucide-react";
import api from "../api";
import { Link } from "react-router-dom";

const Store = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          api.get("/api/products/"),
          api.get("/api/categories/"),
        ]);
        setProducts(productRes.data);
        setCategories(categoryRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = async (product) => {
    const productId = product.productID;
    setAddingToCart((prev) => ({ ...prev, [productId]: true }));

    try {
      await api.post("/api/cart/update/", {
        product_id: productId,
        quantity: 1,
      });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng!");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const filteredProducts = products
    .filter((p) => p.productName.toLowerCase().includes(search.toLowerCase()))
    .filter(
      (p) => !selectedCategory || p.categoryID === Number(selectedCategory)
    )
    .filter((p) => {
      if (filterTab === "popular") return p.rating >= 4.5;
      if (filterTab === "discount") return p.discount > 0;
      return true;
    });

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-bold">Cửa hàng thực phẩm</h1>

        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            <Link
              to="/add-product"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              <Plus size={16} /> Thêm sản phẩm
            </Link>
            <Link
              to="/add-category"
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
            >
              <Plus size={16} /> Thêm danh mục
            </Link>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded"
          placeholder="Tìm kiếm sản phẩm..."
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border px-4 py-2 rounded w-full md:w-auto"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.categoryID} value={cat.categoryID}>
              {cat.categoryName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "Tất cả sản phẩm" },
          { key: "popular", label: "Phổ biến" },
          { key: "discount", label: "Khuyến mãi" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-1 rounded-full font-medium text-sm ${
              filterTab === tab.key
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilterTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const hasDiscount = product.discount > 0;
            const discountPercentage = hasDiscount
              ? Math.round(product.discount)
              : 0;

            return (
              <div
                key={product.productID}
                className="bg-white rounded-lg shadow relative p-4"
              >
                {hasDiscount && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Giảm {discountPercentage}%
                  </div>
                )}

                <div className="h-40 bg-gray-100 mb-3 flex items-center justify-center overflow-hidden">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="object-contain h-full"
                    />
                  )}
                </div>

                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                    {product.category_name}
                  </span>
                  <span className="flex items-center gap-1">
                    ⭐ {product.rating || 4.5}
                  </span>
                </div>

                <h2 className="text-lg font-semibold mb-1">
                  {product.productName}
                </h2>
                <p className="text-sm text-gray-500 mb-2">
                  {product.description}
                </p>

                <div className="mb-2">
                  {hasDiscount ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          {Number(product.price).toLocaleString()}đ
                        </span>
                        <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                          -{discountPercentage}%
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm line-through text-gray-400">
                          Giá gốc:{" "}
                          {Number(product.original_price).toLocaleString()}đ
                        </span>
                        <span className="text-sm text-gray-500">
                          /{product.unit}
                        </span>
                      </div>
                      {product.discount_amount && (
                        <p className="text-xs text-green-600">
                          Tiết kiệm:{" "}
                          {Number(product.discount_amount).toLocaleString()}đ
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {Number(
                          product.price || product.original_price
                        ).toLocaleString()}
                        đ
                      </span>
                      <span className="text-sm text-gray-500">
                        /{product.unit}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  onClick={() => handleAddToCart(product)}
                  disabled={addingToCart[product.productID]}
                >
                  <ShoppingCart size={16} />
                  {addingToCart[product.productID]
                    ? "Đang thêm..."
                    : "Thêm vào giỏ"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Store;
