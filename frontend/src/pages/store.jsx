import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import api from "../api";
import { Link } from "react-router-dom";

const Store = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  // State cho danh sách sản phẩm
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho form tạo danh mục
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryMsg, setCategoryMsg] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // State cho form sản phẩm
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    productName: "",
    price: "",
    unit: "",
    shelfLife: "",
    category: "",
    description: "",
    image: null,
  });
  const [productMsg, setProductMsg] = useState("");
  const [productLoading, setProductLoading] = useState(false);

  // Lấy danh sách categories để chọn
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    if (isAdmin && showProductForm) {
      api.get("/api/categories/").then((res) => setCategories(res.data));
    }
  }, [isAdmin, showProductForm]);

  useEffect(() => {
    // Lấy danh sách sản phẩm từ backend
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/products/");
        setProducts(res.data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryLoading(true);
    setCategoryMsg("");
    try {
      await api.post("/api/categories/", { categoryName });
      setCategoryMsg("Tạo danh mục thành công!");
      setCategoryName("");
      setTimeout(() => {
        setShowCategoryForm(false);
        setCategoryMsg("");
      }, 1200);
    } catch (err) {
      setCategoryMsg(
        err.response?.data?.errors?.categoryName?.[0] || "Có lỗi xảy ra!"
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  // Xử lý thay đổi input
  const handleProductChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setProductForm({ ...productForm, image: files[0] });
    } else {
      setProductForm({ ...productForm, [name]: value });
    }
  };

  // Xử lý submit form
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProductLoading(true);
    setProductMsg("");
    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      await api.post("/api/products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProductMsg("Tạo sản phẩm thành công!");
      setProductForm({
        productName: "",
        price: "",
        unit: "",
        shelfLife: "",
        category: "",
        description: "",
        image: null,
      });
      setTimeout(() => {
        setShowProductForm(false);
        setProductMsg("");
      }, 1200);
    } catch {
      setProductMsg("Có lỗi xảy ra khi tạo sản phẩm!");
    } finally {
      setProductLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex((item) => item.id === product.productID);
    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        id: product.productID,
        name: product.productName,
        price: Number(product.price),
        quantity: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    // Có thể thêm thông báo thành công ở đây nếu muốn
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Cửa hàng thực phẩm</h1>
      {isAdmin && (
        <div className="flex gap-4 mb-6">
          <Link
            to="/add-product"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
          >
            + Thêm sản phẩm
          </Link>
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
            onClick={() => setShowCategoryForm((v) => !v)}
          >
            + Thêm danh mục
          </button>
        </div>
      )}
      {showCategoryForm && (
        <form
          onSubmit={handleCreateCategory}
          className="mb-6 bg-white p-4 rounded shadow max-w-md"
        >
          <div className="mb-2 font-semibold">Tạo danh mục mới</div>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-2"
            placeholder="Tên danh mục"
            required
          />
          <button
            type="submit"
            disabled={categoryLoading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
          >
            {categoryLoading ? "Đang tạo..." : "Tạo danh mục"}
          </button>
          {categoryMsg && (
            <div className="mt-2 text-sm text-center text-green-600">
              {categoryMsg}
            </div>
          )}
        </form>
      )}
      {showProductForm && (
        <form
          onSubmit={handleCreateProduct}
          className="mb-6 bg-white p-4 rounded shadow max-w-md"
          encType="multipart/form-data"
        >
          <div className="mb-2 font-semibold">Tạo sản phẩm mới</div>
          <input
            type="text"
            name="productName"
            value={productForm.productName}
            onChange={handleProductChange}
            className="border px-3 py-2 rounded w-full mb-2"
            placeholder="Tên sản phẩm"
            required
          />
          <input
            type="number"
            name="price"
            value={productForm.price}
            onChange={handleProductChange}
            className="border px-3 py-2 rounded w-full mb-2"
            placeholder="Giá"
            required
          />
          <input
            type="text"
            name="unit"
            value={productForm.unit}
            onChange={handleProductChange}
            className="border px-3 py-2 rounded w-full mb-2"
            placeholder="Đơn vị (ví dụ: /kg, /bó)"
            required
          />
          <input
            type="number"
            name="shelfLife"
            value={productForm.shelfLife}
            onChange={handleProductChange}
            className="border px-3 py-2 rounded w-full mb-2"
            placeholder="Hạn sử dụng (ngày)"
            required
          />
          <select
            name="category"
            value={productForm.category}
            onChange={handleProductChange}
            className="border px-3 py-2 rounded w-full mb-2"
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.categoryID} value={cat.categoryID}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            value={productForm.description}
            onChange={handleProductChange}
            className="border px-3 py-2 rounded w-full mb-2"
            placeholder="Mô tả"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleProductChange}
            className="mb-2"
          />
          <button
            type="submit"
            disabled={productLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
          >
            {productLoading ? "Đang tạo..." : "Tạo sản phẩm"}
          </button>
          {productMsg && (
            <div className="mt-2 text-sm text-center text-green-600">
              {productMsg}
            </div>
          )}
        </form>
      )}
      {loading ? (
        <div>Đang tải sản phẩm...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.productID}
              className="bg-white rounded-lg shadow p-4 relative"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center mb-4">
                <img
                  src={product.image}
                  alt={product.productName}
                  className="max-h-full"
                />
              </div>
              <div className="text-sm text-gray-500 mb-1">
                <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">
                  {product.category_name}
                </span>
              </div>
              <h2 className="text-lg font-semibold">{product.productName}</h2>
              <p className="text-sm text-gray-500">{product.description}</p>
              <div className="mt-2 text-base font-semibold">
                {Number(product.price).toLocaleString()}đ
                <span className="text-sm text-gray-500">{product.unit}</span>
              </div>
              <button
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded flex items-center justify-center gap-2"
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart size={16} />
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Store;
