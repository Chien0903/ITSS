import React, { useState, useEffect } from "react";
import api from "../api";

const Fridge = () => {
  const categories = [
    { value: "vegetable", label: "Rau củ", color: "#10b981" },
    { value: "fruit", label: "Trái cây", color: "#f59e0b" },
    { value: "meat", label: "Thịt", color: "#ef4444" },
    { value: "seafood", label: "Hải sản", color: "#3b82f6" },
    { value: "dairy", label: "Sữa và trứng", color: "#eab308" },
    { value: "grain", label: "Ngũ cốc", color: "#f59e0b" },
    { value: "spices", label: "Gia vị", color: "#8b5cf6" },
    { value: "frozen", label: "Thực phẩm đông lạnh", color: "#06b6d4" },
    { value: "other", label: "Khác", color: "#6b7280" },
  ];

  const units = [
    "kg", "g", "lít", "ml", "cái", "gói", "hộp", "túi", "lon", "chai", "vỉ", "bó", "miếng", "bịch"
  ];

  const [fridgeItems, setFridgeItems] = useState([]);
  const [stats, setStats] = useState({
    total_products: 0,
    expired_products: 0,
    expiring_soon_products: 0,
    popular_categories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("cool");
  const [groupId, setGroupId] = useState(null); // Bạn có thể lấy group_id từ context hoặc người dùng
  const [newItem, setNewItem] = useState({
    productName: "", // Đổi từ 'name' sang 'productName' để khớp với backend
    productID: null, // ID của sản phẩm nếu chọn từ ProductCatalog
    quantity: "",
    unit: "",
    category: "", // Lưu trữ category name
    expiredDate: "",
    location: "cool",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isFromCatalog, setIsFromCatalog] = useState(false); // Theo dõi xem sản phẩm có phải từ catalog không
  const [editingItem, setEditingItem] = useState(null); // Sử dụng để lưu trữ item đang chỉnh sửa
  const DEBUG = true;

  // Hàm để reset form và trạng thái modal
  const resetNewItemForm = () => {
    setNewItem({
      productName: "",
      productID: null,
      quantity: "",
      unit: "",
      category: "",
      expiredDate: "",
      location: "cool",
    });
    setIsFromCatalog(false);
    setSearchResults([]);
    setError(""); // Xóa lỗi khi đóng modal
    setEditingItem(null); // Rất quan trọng: Reset editingItem khi đóng/reset form
  };

  const fetchFridgeList = async () => {
    try {
      setIsLoading(true);
      setError("");
      // Không cần type trong params vì backend lấy hết rồi filter trong code
      const params = groupId ? { group_id: groupId } : {};
      if (DEBUG) console.log("Fetching fridge list with params:", params);
      const response = await api.get("/api/fridge/", { params });
      if (DEBUG) console.log("Fridge data fetched:", response.data);

      // Lọc theo location (activeTab) trên frontend
      const filteredItems = (response.data.items || []).filter(
        (item) => item.location === activeTab
      );
      setFridgeItems(filteredItems);
      setStats(response.data.stats || {
        total_products: 0,
        expired_products: 0,
        expiring_soon_products: 0,
        popular_categories: [],
      });
    } catch (error) {
      console.error("Error fetching fridge lists:", error);
      setError(
        error.response?.data?.detail ||
        "Không thể tải danh sách thực phẩm trong tủ lạnh. Thử lại sau"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchProduct = async (inputValue) => {
    // Chỉ cho phép tìm kiếm khi không ở chế độ chỉnh sửa
    if (editingItem) return;

    setNewItem({ ...newItem, productName: inputValue, productID: null }); // Reset productID khi gõ lại
    setIsFromCatalog(false); // Mặc định là tự tạo mới khi người dùng gõ

    if (inputValue.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.get("/api/products/search/", {
        params: { query: inputValue },
      });
      setSearchResults(response.data.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  };

  const handleSelectSuggestedProduct = (product) => {
    // Chỉ cho phép chọn gợi ý khi không ở chế độ chỉnh sửa
    if (editingItem) return;

    setNewItem({
      ...newItem,
      productName: product.productName, // Sử dụng productName từ catalog
      productID: product.productID, // Lưu ID của sản phẩm catalog
      category: product.category?.categoryName || "", // Lấy category name từ catalog
      unit: product.unit || "", // Lấy unit từ catalog
    });
    setIsFromCatalog(true);
    setSearchResults([]); // Xóa gợi ý sau khi chọn
  };

  const handleAddItem = async () => {
    setError(""); // Reset lỗi trước khi gửi request

    // Kiểm tra các trường bắt buộc cho thêm mới
    if (!newItem.productName || !newItem.quantity || !newItem.unit || !newItem.category || !newItem.expiredDate || !newItem.location) {
      setError("Vui lòng điền đầy đủ thông tin sản phẩm (Tên, Số lượng, Đơn vị, Danh mục, Ngày hết hạn, Vị trí).");
      return;
    }

    const payload = {
      quantity: Number(newItem.quantity),
      location: newItem.location,
      expiredDate: newItem.expiredDate,
    };

    if (isFromCatalog) {
      payload.productID = newItem.productID; // SỬA LỖI TYPO Ở ĐÂY
      payload.productName = newItem.productName;
    } else {
      payload.productName = newItem.productName;
      payload.unit = newItem.unit;
      payload.category = newItem.category;
    }

    try {
      const res = await api.post("/api/fridge/", payload);
      if (DEBUG) console.log("Thêm sản phẩm thành công", res.data);
      setIsModalOpen(false);
      resetNewItemForm(); // Reset form sau khi thêm
      fetchFridgeList(); // Tải lại danh sách tủ lạnh
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      setError(
        "Lỗi khi thêm sản phẩm: " +
          (error.response ? JSON.stringify(error.response.data) : error.message)
      );
    }
  };

  // Hàm xử lý việc cập nhật sản phẩm
  const handleUpdateItem = async () => {
    setError("");

    // Kiểm tra các trường bắt buộc cho cập nhật
    // Cần đảm bảo editingItem tồn tại
    if (!editingItem || !newItem.quantity || !newItem.expiredDate || !newItem.location) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (Số lượng, Ngày hết hạn, Vị trí) hoặc không có sản phẩm nào được chọn.");
      return;
    }

    // Payload cho việc cập nhật. Chỉ gửi các trường có thể thay đổi
    // KHÔNG NÊN GỬI productName, unit, category khi update item trong tủ lạnh
    // vì chúng là định danh sản phẩm. Chỉ gửi các trường có thể thay đổi như số lượng, hạn sử dụng, vị trí.
    const payload = {
      quantity: Number(newItem.quantity),
      expiredDate: newItem.expiredDate,
      location: newItem.location,
    };

    try {
      // Gửi PATCH request đến ID của sản phẩm đang được chỉnh sửa
      const res = await api.patch(`/api/fridge/${editingItem.id}/`, payload);
      if (DEBUG) console.log("Cập nhật sản phẩm thành công", res.data);
      setIsModalOpen(false);
      resetNewItemForm(); // Reset form và trạng thái editingItem
      fetchFridgeList();
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      setError(
        "Lỗi khi cập nhật sản phẩm: " +
          (error.response ? JSON.stringify(error.response.data) : error.message)
      );
    }
  };

  // Hàm này để mở modal chỉnh sửa và điền dữ liệu
  const openEditModal = (item) => {
    setEditingItem(item); // Lưu item cần chỉnh sửa
    // Điền dữ liệu của item vào form
    // Đảm bảo expiredDate có định dạng YYYY-MM-DD
    const formattedExpiredDate = item.expiredDate ? new Date(item.expiredDate).toISOString().split('T')[0] : '';
    setNewItem({
      productName: item.product_name,
      productID: item.product_id || null, // Lưu product_id nếu có
      quantity: item.quantity,
      unit: item.product_unit,
      category: item.product_category_name || "",
      expiredDate: formattedExpiredDate,
      location: item.location,
    });
    // Đặt trạng thái isFromCatalog dựa trên product_id
    // Nếu có product_id tức là sản phẩm này được tạo từ catalog
    setIsFromCatalog(!!item.product_id);
    setIsModalOpen(true); // Mở modal
  };

  const deleteItem = async (id) => {
    try {
      if (DEBUG) console.log("Deleting item with id:", id);
      await api.delete(`/api/fridge/${id}/`);
      fetchFridgeList();
    } catch (error) {
      console.error("Error deleting item:", error);
      setError(
        error.response?.data?.detail || "Không thể xóa sản phẩm. Thử lại sau."
      );
    }
  };

  useEffect(() => {
    fetchFridgeList();
  }, [groupId, activeTab]);

  return (
    <div className="p-6">
      {/* Hiển thị lỗi ngoài modal nếu modal đóng */}
      {error && !isModalOpen && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Quản lý tủ lạnh</h1>
            <button
              onClick={() => {
                resetNewItemForm(); // Reset form khi mở modal thêm mới
                setIsModalOpen(true);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              + Thêm sản phẩm mới
            </button>
          </div>

          {/* Modal để thêm/sửa sản phẩm */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                  {editingItem ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <div className="space-y-4">
                  {/* Tên sản phẩm */}
                  <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">Tên sản phẩm</label>
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm"
                      value={newItem.productName}
                      onChange={(e) => handleSearchProduct(e.target.value)}
                      // Vô hiệu hóa khi chỉnh sửa HOẶC đã chọn từ catalog (khi thêm mới)
                      // Khi chỉnh sửa, tên sản phẩm không được thay đổi
                      disabled={!!editingItem || isFromCatalog}
                      className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Hiển thị gợi ý tìm kiếm nếu KHÔNG đang chỉnh sửa và CHƯA chọn từ catalog */}
                    {!editingItem && !isFromCatalog && searchResults.length > 0 && (
                      <ul className="border rounded mt-1 max-h-40 overflow-y-auto bg-white shadow z-10">
                        {searchResults.map((product) => (
                          <li
                            key={product.productID}
                            className="px-3 py-2 hover:bg-green-100 cursor-pointer"
                            onClick={() => handleSelectSuggestedProduct(product)}
                          >
                            {product.productName} — {product.unit} ({product.category?.categoryName || 'Không phân loại'})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      {/* Số lượng */}
                      <label className="block font-medium text-sm text-gray-700 mb-1">Số lượng</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="Số lượng"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex-1">
                      {/* Đơn vị */}
                      <label className="block font-medium text-sm text-gray-700 mb-1">Đơn vị</label>
                      <select
                        value={newItem.unit || ""}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        // Vô hiệu hóa khi chỉnh sửa HOẶC đã chọn từ catalog (khi thêm mới)
                        disabled={!!editingItem || isFromCatalog}
                        className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Chọn đơn vị</option>
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Danh mục */}
                  <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">Danh mục</label>
                    <select
                      value={newItem.category || ""}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      // Vô hiệu hóa khi chỉnh sửa HOẶC đã chọn từ catalog (khi thêm mới)
                      disabled={!!editingItem || isFromCatalog}
                      className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.label}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ngày hết hạn */}
                  <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">Ngày hết hạn</label>
                    <input
                      type="date"
                      value={newItem.expiredDate}
                      onChange={(e) => setNewItem({ ...newItem, expiredDate: e.target.value })}
                      className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Vị trí */}
                  <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">Vị trí</label>
                    <select
                      value={newItem.location}
                      onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                      className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="cool">Tủ lạnh</option>
                      <option value="freeze">Ngăn đông</option>
                    </select>
                  </div>
                </div>

                {/* Hiển thị lỗi bên trong modal */}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      resetNewItemForm(); // Reset form sau khi đóng
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={editingItem ? handleUpdateItem : handleAddItem}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    {editingItem ? "Lưu thay đổi" : "Thêm"} {/* Thay đổi chữ trên nút */}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Tổng sản phẩm</p>
              <p className="text-2xl font-semibold">{stats.total_products}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Sản phẩm sắp hết hạn</p>
              <p className="text-2xl font-semibold text-yellow-500">
                {stats.expiring_soon_products}
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Sản phẩm đã hết hạn</p>
              <p className="text-2xl font-semibold text-red-500">{stats.expired_products}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Phân loại phổ biến</p>
              <p className="text-2xl font-semibold">
                {stats.popular_categories[0]?.categoryName || "Không có"}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow mb-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Gợi ý món ăn từ tủ lạnh</h2>
            <p className="text-gray-500">Không tìm thấy công thức phù hợp với nguyên liệu hiện có</p>
            <div className="text-gray-400 mt-4">
              <span className="text-5xl">👨‍🍳</span>
              <p className="mt-2">Hãy thêm nhiều nguyên liệu hơn vào tủ lạnh để nhận gợi ý món ăn</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              className={`px-3 py-1 rounded ${
                activeTab === "cool" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setActiveTab("cool")}
            >
              Tủ lạnh
            </button>
            <button
              className={`px-3 py-1 rounded ${
                activeTab === "freeze" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => setActiveTab("freeze")}
            >
              Ngăn đông
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fridgeItems.length > 0 ? (
              fridgeItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border p-4 rounded shadow relative ${
                    item.expiredDate && new Date(item.expiredDate) < new Date() ? 'border-red-300' :
                    item.isExpiringSoon ? 'border-yellow-300' : 'border-gray-200'
                  }`}
                >
                  <h3 className="text-lg font-semibold">{item.product_name || "Sản phẩm"}</h3>
                  <p className="text-sm text-gray-500">{item.quantity} {item.product_unit}</p>
                  <p className="text-sm mt-2 font-medium">
                    Ngày hết hạn: {new Date(item.expiredDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-sm mt-1 font-medium">
                    {item.isExpiringSoon ? (
                      <span className="text-yellow-500">⚠ Sắp hết hạn!</span>
                    ) : item.expiredDate && new Date(item.expiredDate) < new Date() ? (
                      <span className="text-red-500">⚠ Đã hết hạn!</span>
                    ) : (
                      <span className="text-green-500">Còn hạn</span>
                    )}
                  </p>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="mt-2 text-blue-500 hover:text-blue-700 px-2 py-1"
                  >
                    Sửa
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Không có thực phẩm trong {activeTab === "cool" ? "tủ lạnh" : "ngăn đông"}.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Fridge;