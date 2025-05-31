// Store.jsx - đã cập nhật thêm 2 nút + routing + responsive cho admin

import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, Eye, Edit, Trash2 } from "lucide-react";
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

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

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    setDeletingProduct(productId);
    try {
      await api.delete(`/api/products/${productId}/`);
      setProducts(products.filter((p) => p.productID !== productId));
      alert("Đã xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Có lỗi xảy ra khi xóa sản phẩm!");
    } finally {
      setDeletingProduct(null);
    }
  };

  const closeProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
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
                        {/* <span className="text-sm text-gray-500">
                          /{product.unit}
                        </span> */}
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
                      {/* <span className="text-sm text-gray-500">
                        /{product.unit}
                      </span> */}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart[product.productID]}
                  >
                    <ShoppingCart size={16} />
                    {addingToCart[product.productID]
                      ? "Đang thêm..."
                      : "Thêm vào giỏ"}
                  </button>

                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                    onClick={() => handleViewProduct(product)}
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </button>

                  {isAdmin && (
                    <>
                      <Link
                        to={`/edit-product/${product.productID}`}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded flex items-center justify-center"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </Link>

                      <button
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded disabled:opacity-50"
                        onClick={() => handleDeleteProduct(product.productID)}
                        disabled={deletingProduct === product.productID}
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetail && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedProduct.productName}
                </h2>
                <button
                  onClick={closeProductDetail}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Product Image */}
              <div className="mb-6">
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.productName}
                      className="object-contain h-full w-full"
                    />
                  ) : (
                    <div className="text-gray-400 text-6xl">📦</div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Thông tin sản phẩm
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Tên sản phẩm:</span>
                      <p className="font-medium">
                        {selectedProduct.productName}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-600">Danh mục:</span>
                      <p className="font-medium">
                        {selectedProduct.category_name || "Chưa phân loại"}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-600">Đơn vị:</span>
                      <p className="font-medium">{selectedProduct.unit}</p>
                    </div>

                    <div>
                      <span className="text-gray-600">Hạn sử dụng:</span>
                      <p className="font-medium">
                        {selectedProduct.shelfLife} ngày
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-600">Loại sản phẩm:</span>
                      <p className="font-medium">
                        {selectedProduct.isCustom
                          ? "Sản phẩm tùy chỉnh"
                          : "Sản phẩm hệ thống"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Giá cả</h3>

                  <div className="space-y-3">
                    {selectedProduct.discount > 0 ? (
                      <>
                        <div>
                          <span className="text-gray-600">Giá hiện tại:</span>
                          <p className="text-2xl font-bold text-red-600">
                            {Number(selectedProduct.price).toLocaleString()}đ
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-600">Giá gốc:</span>
                          <p className="text-lg line-through text-gray-400">
                            {Number(
                              selectedProduct.original_price
                            ).toLocaleString()}
                            đ
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-600">Giảm giá:</span>
                          <p className="text-lg font-semibold text-green-600">
                            {Math.round(selectedProduct.discount)}% (
                            {Number(
                              selectedProduct.discount_amount || 0
                            ).toLocaleString()}
                            đ)
                          </p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-gray-600">Giá:</span>
                        <p className="text-2xl font-bold text-gray-900">
                          {Number(
                            selectedProduct.price ||
                              selectedProduct.original_price
                          ).toLocaleString()}
                          đ
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3">Mô tả</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    closeProductDetail();
                  }}
                  disabled={addingToCart[selectedProduct.productID]}
                >
                  <ShoppingCart size={20} />
                  {addingToCart[selectedProduct.productID]
                    ? "Đang thêm..."
                    : "Thêm vào giỏ hàng"}
                </button>

                {isAdmin && (
                  <>
                    <Link
                      to={`/edit-product/${selectedProduct.productID}`}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-medium"
                      onClick={closeProductDetail}
                    >
                      <Edit size={20} />
                      Chỉnh sửa
                    </Link>

                    <button
                      className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-medium"
                      onClick={() => {
                        handleDeleteProduct(selectedProduct.productID);
                        closeProductDetail();
                      }}
                      disabled={deletingProduct === selectedProduct.productID}
                    >
                      <Trash2 size={20} />
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
