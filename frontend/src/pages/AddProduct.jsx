import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const AddProduct = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    productName: "",
    price: "",
    unit: "",
    shelfLife: "",
    category: "",
    description: "",
    image: null,
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      api.get("/api/categories/").then((res) => setCategories(res.data));
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      const res = await api.post("/api/products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(res.data);
      setMsg("Tạo sản phẩm thành công!");
      setUploadedUrl(res.data.data?.image || null);
      setTimeout(() => navigate("/store"), 1200);
    } catch {
      setMsg("Có lỗi xảy ra khi tạo sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-red-500">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow max-w-md w-full"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Thêm sản phẩm mới
        </h2>
        <input
          type="text"
          name="productName"
          value={form.productName}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full mb-2"
          placeholder="Tên sản phẩm"
          required
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full mb-2"
          placeholder="Giá"
          required
        />
        <input
          type="text"
          name="unit"
          value={form.unit}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full mb-2"
          placeholder="Đơn vị (ví dụ: /kg, /bó)"
          required
        />
        <input
          type="number"
          name="shelfLife"
          value={form.shelfLife}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full mb-2"
          placeholder="Hạn sử dụng (ngày)"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
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
          value={form.description}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full mb-2"
          placeholder="Mô tả"
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="mb-2"
        />
        {preview && (
          <img src={preview} alt="preview" width={200} className="mb-2" />
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium w-full"
        >
          {loading ? "Đang tạo..." : "Tạo sản phẩm"}
        </button>
        {msg && (
          <div className="mt-2 text-sm text-center text-green-600">{msg}</div>
        )}
        {uploadedUrl && (
          <div className="mt-2 text-center">
            <p>Ảnh đã upload:</p>
            <img src={uploadedUrl} alt="uploaded" width={200} />
          </div>
        )}
      </form>
    </div>
  );
};

export default AddProduct;
