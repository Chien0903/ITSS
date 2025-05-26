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
    productName: "",
    productID: null, // Sẽ lưu ID nếu chọn từ catalog
    quantity: "",
    unit: "",
    categoryName: "",
    expiredDate: "",
    location: "cool",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTermProduct, setSearchTermProduct] = useState(""); // Từ khóa tìm kiếm sản phẩm trong modal
  const [searchResults, setSearchResults] = useState([]); // Kết quả tìm kiếm sản phẩm
  const [isFromCatalog, setIsFromCatalog] = useState(false); // Cờ kiểm tra sản phẩm có từ catalog không
  const [editingItem, setEditingItem] = useState(null);
  const DEBUG = true;

  const resetNewItemForm = () => {
    setNewItem({
      productName: "",
      productID: null,
      quantity: "",
      unit: "",
      categoryName: "",
      expiredDate: "",
      location: "cool",
    });
    setSearchTermProduct("");
    setSearchResults([]);
    setIsFromCatalog(false);
    setError("");
    setEditingItem(null);
  };

  const fetchFridgeList = async () => {
    try {
      setIsLoading(true);
      setError("");
      const params = groupId ? { group_id: groupId } : {};
      if (DEBUG) console.log("Fetching fridge list with params:", params);
      const response = await api.get("/api/fridge/", { params });
      if (DEBUG) console.log("Fridge data fetched:", response.data);

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

  // Xử lý tìm kiếm sản phẩm trong catalog
  const handleSearchProduct = async (e) => {
    const term = e.target.value;
    setSearchTermProduct(term);
    setNewItem({ ...newItem, productName: term, productID: null, unit: "", categoryName: "" }); // Reset productID, unit, category khi gõ mới
    setIsFromCatalog(false); // Đặt lại cờ khi người dùng gõ tìm kiếm

    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.get("/api/products/search/", {
        params: { q: term },
      });
      // Lọc bỏ các sản phẩm đã chọn (nếu có logic tương tự như recipe)
      // Hiện tại không có selectedProducts list, nên không cần lọc
      setSearchResults(response.data.map(product => ({
        productID: product.productID,
        productName: product.productName,
        unit: product.unit,
        categoryName: product.categoryName || "Null"
      })));
      
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  };

  // Xử lý khi chọn một sản phẩm từ danh sách gợi ý
  const handleSelectSuggestedProduct = (product) => {
    setNewItem({
      ...newItem,
      productName: product.productName,
      productID: product.productID,
      categoryName: product.categoryName,
      unit: product.unit,
    });
    setIsFromCatalog(true); // Đánh dấu là từ catalog
    setSearchTermProduct(product.productName); // Giữ giá trị hiển thị trong ô input
    setSearchResults([]); // Xóa danh sách gợi ý
  };

  // Xử lý khi người dùng muốn thêm một sản phẩm hoàn toàn mới (không có trong catalog)
  const handleAddNewProductManually = () => {
    setNewItem({
      ...newItem,
      productID: null, // Đảm bảo productID là null để báo hiệu sản phẩm mới
      productName: searchTermProduct.trim(), // Đặt tên sản phẩm từ searchTermProduct
      unit: "", // Cho phép người dùng chọn đơn vị
      categoryName: "", // Cho phép người dùng chọn danh mục
    });
    setIsFromCatalog(false); // Đảm bảo đây là sản phẩm tự tạo
    setSearchResults([]); // Xóa gợi ý
  };


  const handleAddItem = async () => {
    setError("");

    if (!newItem.productName || !newItem.quantity || !newItem.unit || !newItem.categoryName || !newItem.expiredDate || !newItem.location) {
      setError("Vui lòng điền đầy đủ thông tin sản phẩm (Tên, Số lượng, Đơn vị, Danh mục, Ngày hết hạn, Vị trí).");
      return;
    }

    const payload = {
      quantity: Number(newItem.quantity),
      location: newItem.location,
      expiredDate: newItem.expiredDate,
    };

    if (isFromCatalog && newItem.productID) {
      payload.product_id = newItem.productID;
    } else {
      payload.productName = newItem.productName;
      payload.unit = newItem.unit;
      payload.categoryName = newItem.categoryName;
    }

    try {
      const res = await api.post("/api/fridge/", payload);
      if (DEBUG) console.log("Thêm sản phẩm thành công", res.data);
      setIsModalOpen(false);
      resetNewItemForm();
      fetchFridgeList();
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      setError(
        "Lỗi khi thêm sản phẩm: " +
        (error.response ? JSON.stringify(error.response.data) : error.message)
      );
    }
  };

  const handleUpdateItem = async () => {
    setError("");

    if (!editingItem || !newItem.quantity || !newItem.expiredDate || !newItem.location) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (Số lượng, Ngày hết hạn, Vị trí) hoặc không có sản phẩm nào được chọn.");
      return;
    }
    const payload = {
      quantity: Number(newItem.quantity),
      expiredDate: newItem.expiredDate,
      location: newItem.location,
    };

    try {
      const res = await api.patch(`/api/fridge/${editingItem.id}/`, payload);
      if (DEBUG) console.log("Cập nhật sản phẩm thành công", res.data);
      setIsModalOpen(false);
      resetNewItemForm();
      fetchFridgeList();
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      setError(
        "Lỗi khi cập nhật sản phẩm: " +
        (error.response ? JSON.stringify(error.response.data) : error.message)
      );
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    const formattedExpiredDate = item.expiredDate ? new Date(item.expiredDate).toISOString().split('T')[0] : '';
    setNewItem({
      productName: item.product_name,
      productID: item.product_id || null, // Đảm bảo productID được lấy nếu có
      quantity: item.quantity,
      unit: item.product_unit,
      categoryName: item.product_category_name || "",
      expiredDate: formattedExpiredDate,
      location: item.location,
    });
    setSearchTermProduct(item.product_name); // Đặt searchTermProduct để hiển thị tên sản phẩm
    setIsFromCatalog(!!item.product_id); // Dựa vào product_id để xác định có phải từ catalog không
    setIsModalOpen(true);
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

  const getCategoryColor = (categoryLabel) => {
    const category = categories.find(cat => cat.label === categoryLabel);
    return category ? category.color : "#6b7280"; // Màu xám mặc định nếu không tìm thấy
  };

  return (
    <div className="p-6">
      {error && !isModalOpen && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Quản lý tủ lạnh</h1>
            <button
              onClick={() => {
                resetNewItemForm();
                setIsModalOpen(true);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              + Thêm sản phẩm mới
            </button>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                  {editingItem ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">Tên sản phẩm</label>
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm hoặc tìm trong catalog"
                      value={editingItem ? newItem.productName : searchTermProduct} // Sử dụng searchTermProduct khi thêm mới, newItem.productName khi sửa
                      onChange={handleSearchProduct} // Chỉ gọi search khi thêm mới
                      disabled={!!editingItem || isFromCatalog} // Vô hiệu hóa khi chỉnh sửa HOẶC đã chọn từ catalog
                      className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Hiển thị gợi ý tìm kiếm HOẶC tùy chọn thêm mới nếu không đang chỉnh sửa */}
                    {!editingItem && searchTermProduct.length > 0 && searchResults.length > 0 && !isFromCatalog && (
                      <ul className="border rounded mt-1 max-h-40 overflow-y-auto bg-white shadow z-10">
                        {searchResults.map((product) => (
                          <li
                            key={product.productID}
                            className="px-3 py-2 hover:bg-green-100 cursor-pointer"
                            onClick={() => handleSelectSuggestedProduct(product)}
                          >
                            {product.productName} — {product.unit} ({product.categoryName || 'Không phân loại'})
                          </li>
                        ))}
                        {/* Tùy chọn "Thêm sản phẩm mới" nếu có searchTermProduct và không tìm thấy sản phẩm khớp hoàn toàn */}
                        {searchTermProduct.length > 0 &&
                          !searchResults.some(
                            (p) => p.productName.toLowerCase() === searchTermProduct.toLowerCase()
                          ) && (
                            <li
                              className="p-2 hover:bg-green-100 cursor-pointer text-blue-500 border-t"
                              onClick={handleAddNewProductManually}
                            >
                              Thêm sản phẩm mới: <strong>{searchTermProduct}</strong>
                            </li>
                          )}
                      </ul>
                    )}

                    {/* Hiển thị "Thêm sản phẩm mới" ngay cả khi không có gợi ý nếu có searchTermProduct và không ở chế độ catalog */}
                    {!editingItem && !isFromCatalog && searchTermProduct.length > 0 && searchResults.length === 0 && (
                        <div
                          className="p-2 hover:bg-green-100 cursor-pointer text-blue-500 border rounded mt-1 bg-white shadow z-10"
                          onClick={handleAddNewProductManually}
                        >
                          Thêm sản phẩm mới: <strong>{searchTermProduct}</strong>
                        </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
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
                      <label className="block font-medium text-sm text-gray-700 mb-1">Đơn vị</label>
                      <select
                        value={newItem.unit || ""}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        disabled={!!editingItem || isFromCatalog} // Vô hiệu hóa khi chỉnh sửa HOẶC đã chọn từ catalog
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

                  <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">Danh mục</label>
                    <select
                      value={newItem.categoryName || ""}
                      onChange={(e) => setNewItem({ ...newItem, categoryName: e.target.value })}
                      disabled={!!editingItem || isFromCatalog} // Vô hiệu hóa khi chỉnh sửa HOẶC đã chọn từ catalog
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

                  <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">Ngày hết hạn</label>
                    <input
                      type="date"
                      value={newItem.expiredDate}
                      onChange={(e) => setNewItem({ ...newItem, expiredDate: e.target.value })}
                      className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

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

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      resetNewItemForm();
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={editingItem ? handleUpdateItem : handleAddItem}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    {editingItem ? "Lưu thay đổi" : "Thêm"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                  <p className="text-sm text-gray-500">
                      {item.quantity} {item.product_unit}
                  </p>
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
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Xóa
                    </button>
                  </div>
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