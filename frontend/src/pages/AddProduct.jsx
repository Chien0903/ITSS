import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    discount: 0,
    category: "",
    shelfLife: 30,
    unit: "kg",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const units = [
    "kg",
    "g",
    "lít",
    "ml",
    "cái",
    "gói",
    "hộp",
    "túi",
    "lon",
    "chai",
    "vỉ",
    "bó",
  ];

  useEffect(() => {
    // Lấy danh sách categories từ backend
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories/");
        console.log("Categories response:", res.data);
        setCategories(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.description ||
      formData.price <= 0 ||
      !formData.category
    ) {
      setMessage("Vui lòng điền đầy đủ thông tin sản phẩm!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const submitFormData = new FormData();
      submitFormData.append("productName", formData.name);
      submitFormData.append("description", formData.description);
      submitFormData.append("price", formData.price);
      submitFormData.append("discount", formData.discount);
      submitFormData.append("unit", formData.unit);
      submitFormData.append("shelfLife", formData.shelfLife);
      submitFormData.append("category", formData.category);

      if (formData.image) {
        submitFormData.append("image", formData.image);
      }

      await api.post("/api/products/", submitFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Tạo sản phẩm thành công!");
      setTimeout(() => navigate("/store"), 1500);
    } catch (error) {
      console.error("Lỗi:", error);
      setMessage("Lỗi khi tạo sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData({ ...formData, image: null });
  };

  const calculateDiscountPercent = () => {
    if (formData.discount && formData.price > 0) {
      return Math.round((formData.discount / formData.price) * 100);
    }
    return 0;
  };

  const discountedPrice = formData.price - formData.discount;
  const hasDiscount = formData.discount > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/store"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại cửa hàng
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Thông tin cơ bản
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên sản phẩm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả sản phẩm *
                </label>
                <textarea
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Danh mục *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option
                        key={category.categoryID}
                        value={category.categoryID}
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Đơn vị *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Giá và thông tin khác */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Giá và thông tin khác
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Giá gốc (VNĐ) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Giảm giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.price}
                    placeholder="0"
                    value={formData.discount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {hasDiscount && formData.price > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Giảm {calculateDiscountPercent()}%
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hạn sử dụng (ngày) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={formData.shelfLife || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shelfLife: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hình ảnh */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Hình ảnh sản phẩm
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tải lên hình ảnh
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {imagePreview && (
                <div className="relative w-full max-w-xs">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Xem trước sản phẩm
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">
                    {formData.name || "Tên sản phẩm"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formData.description || "Mô tả sản phẩm"}
                  </p>

                  <div className="flex items-baseline gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="font-bold text-red-600">
                          {discountedPrice.toLocaleString()}đ
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formData.price.toLocaleString()}đ
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">
                        {formData.price.toLocaleString()}đ
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      /{formData.unit}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {categories.find((c) => c.categoryID == formData.category)
                        ?.categoryName || "Danh mục"}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formData.shelfLife} ngày
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Đang thêm..." : "Thêm sản phẩm"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Sản phẩm sẽ được thêm vào cửa hàng
                </p>

                {message && (
                  <p
                    className={`text-xs text-center ${
                      message.includes("thành công")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
