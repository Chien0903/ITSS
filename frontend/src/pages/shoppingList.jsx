import React, { useState, useEffect } from "react";
import { Plus, ShoppingCart, Edit2, X, Trash2 } from "lucide-react";
import api from "../api";

const ShoppingList = () => {
  const [lists, setLists] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(null);
  const [showAddProductPopup, setShowAddProductPopup] = useState(false);
  const [showCustomProductPopup, setShowCustomProductPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newList, setNewList] = useState({
    listName: "",
    type: "day",
    date: "",
  });
  const [editList, setEditList] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
  });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  const groupID = localStorage.getItem("selectedGroup");
  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user.id;

  // Debug
  useEffect(() => {
    console.log("localStorage keys:", Object.keys(localStorage));
    console.log("selectedGroup:", localStorage.getItem("selectedGroup"));
    console.log("user:", localStorage.getItem("userID"));
  }, []);

  useEffect(() => {
    if (!groupID || !userID) {
      setError("Thiếu thông tin nhóm hoặc người dùng. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }
    fetchLists();
  }, []);

  //Lấy danh sách mua sắm
  const fetchLists = async () => {
    try {
      const response = await api.get("/api/shopping-list/", {
        params: { group: groupID },
      });
      setLists(response.data);
    } catch (err) {
      console.error("Error fetching lists:", err);
      setError("Không thể tải danh sách.");
    } finally {
      setLoading(false);
    }
  };

  //Tạo danh sách mua sắm
  const handleCreateList = async () => {
    if (!newList.listName || !newList.date) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const response = await api.post("/api/shopping-list/", {
        listName: newList.listName,
        type: newList.type,
        date: newList.date,
        group: groupID,
        user: userID,
      });
      setLists([...lists, response.data]);
      setNewList({ listName: "", type: "day", date: "" });
      setShowCreatePopup(false);
    } catch (err) {
      console.error("Error creating list:", err);
      if (err.response && err.response.data) {
        console.error("API response error:", err.response.data);
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Không thể tạo danh sách mới");
      }
    }
  };

  //Update danh sách mua sắm: sửa tên, loại, ngày giờ,...
  const handleUpdateList = async () => {
    if (!editList.listName || !editList.date) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const response = await api.put(`/api/shopping-list/${editList.listID}/`, {
        listName: editList.listName,
        type: editList.type,
        date: editList.date,
        group: groupID,
        user: userID,
      });
      setLists(lists.map((list) => (list.listID === editList.listID ? response.data : list)));
      setEditList(null);
    } catch (err) {
      console.error("Error updating list:", err);
      alert("Không thể cập nhật danh sách");
    }
  };

  //Xóa danh sách mua sắm
  const handleDeleteList = async (listID) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh sách này?")) {
      return;
    }

    try {
      await api.delete(`/api/shopping-list/${listID}/`);
      setLists(lists.filter((list) => list.listID !== listID));
      setShowDetailsPopup(null);
      setEditList(null);
    } catch (err) {
      console.error("Error deleting list:", err);
      alert("Không thể xóa danh sách");
    }
  };

  //---Thêm vào danh sách mua sắm sản phẩm có sẵn-----
  //Lấy danh sách sản phẩm có sẵn
  const fetchAvailableProducts = async () => {
    setProductLoading(true);
    try {
      // Dummy data
      const dummyProducts = [
        { id: 1, name: "Sữa tươi", price: 25000, quantity: 1 },
        { id: 2, name: "Bánh mì", price: 15000, quantity: 1 },
        { id: 3, name: "Trứng gà", price: 3000, quantity: 10 },
        { id: 4, name: "Gạo ST25", price: 20000, quantity: 1 },
        { id: 5, name: "Nước mắm", price: 35000, quantity: 1 },
        { id: 6, name: "Dầu ăn", price: 45000, quantity: 1 },
        { id: 7, name: "Thịt lợn", price: 120000, quantity: 1 },
        { id: 8, name: "Rau muống", price: 10000, quantity: 1 },
      ];
      setAvailableProducts(dummyProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      alert("Không thể tải danh sách sản phẩm");
    } finally {
      setProductLoading(false);
    }
  };

  //Thêm sản phẩm vào danh sách mua sắm: lỗi
  const handleAddProduct = async (product) => {
    try {
      const response = await api.post(`/api/shopping-list/${showDetailsPopup.listID}/items/`, {
        name: product.name,
        price: product.price || 0,
        quantity: product.quantity || 1,
        done: false,
      });
      setLists(
        lists.map((list) =>
          list.listID === showDetailsPopup.listID
            ? { ...list, items: [...(list.items || []), response.data] }
            : list
        )
      );
      setShowAddProductPopup(false);
      setShowCustomProductPopup(false);
      setNewProduct({ name: "", price: "", quantity: "" });
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Không thể thêm sản phẩm");
    }
  };

  //Chỉnh sửa trạng thái của sản phẩm (đã mua, chưa mua,...)
  const handleToggleItemDone = async (listID, itemID) => {
    try {
      const list = lists.find((l) => l.listID === listID);
      const item = list.items.find((i) => i.id === itemID);
      const response = await api.patch(`/api/shopping-list/${listID}/items/${itemID}/`, {
        done: !item.done,
      });
      setLists(
        lists.map((list) =>
          list.listID === listID
            ? {
                ...list,
                items: list.items.map((i) => (i.id === itemID ? response.data : i)),
              }
            : list
        )
      );
    } catch (err) {
      console.error("Error toggling item:", err);
      alert("Không thể cập nhật trạng thái sản phẩm");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Danh sách mua sắm</h1>
        <button
          onClick={() => setShowCreatePopup(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={18} />
          Tạo danh sách mới
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {lists.length === 0 && (
            <div className="col-span-3 text-center text-gray-500">
              Chưa có danh sách nào. Hãy tạo một danh sách mới!
            </div>
          )}
          {lists.map((list) => (
            <div
              key={list.listID}
              className="bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-lg"
            >
              <h2 className="font-semibold text-lg">{list.listName}</h2>
              <p className="text-sm text-gray-500">
                {new Date(list.date).toLocaleDateString()} -{" "}
                <span className="font-semibold">{list.type === "day" ? "Ngày" : "Tuần"}</span>
              </p>
              <div className="mt-3">
                <p className="text-sm font-medium mb-1">Tiến độ: {list.progress ?? 0}%</p>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-green-500 rounded"
                    style={{ width: `${list.progress ?? 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {(list.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 ${item.done ? "line-through text-gray-400" : ""}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${item.color || "bg-gray-300"}`}></span>
                    {item.name}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowDetailsPopup(list)}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 text-sm rounded-md py-2"
              >
                <ShoppingCart size={16} />
                Chi tiết
              </button>
            </div>
          ))}
          <div
            onClick={() => setShowCreatePopup(true)}
            className="border border-dashed rounded-lg flex items-center justify-center text-center text-gray-500 cursor-pointer hover:bg-gray-50"
            style={{ minHeight: "150px" }}
          >
            <div>
              <Plus className="mx-auto mb-2" size={32} />
              <p className="font-semibold">Tạo danh sách mới</p>
              <p className="text-sm">Lên kế hoạch mua sắm ngay</p>
            </div>
          </div>
        </div>
      )}

      {/* Popup tạo danh sách */}
      {showCreatePopup && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-80"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            <h2 className="text-xl font-semibold mb-4">Tạo danh sách mới</h2>
            <label className="block mb-3">
              <span className="block mb-1 font-medium">Loại danh sách</span>
              <select
                className="w-full border rounded px-3 py-2"
                value={newList.type}
                onChange={(e) => setNewList((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
              </select>
            </label>
            <label className="block mb-3">
              <span className="block mb-1 font-medium">
                {newList.type === "week" ? "Ngày bắt đầu tuần" : "Ngày"}
              </span>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={newList.date}
                onChange={(e) => setNewList((prev) => ({ ...prev, date: e.target.value }))}
              />
            </label>
            <label className="block mb-4">
              <span className="block mb-1 font-medium">Tên danh sách</span>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Nhập tên danh sách"
                value={newList.listName}
                onChange={(e) => setNewList((prev) => ({ ... dyesprev, listName: e.target.value }))}
              />
            </label>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowCreatePopup(false)}
              >
                Hủy
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleCreateList}
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup chi tiết danh sách mua sắm */}
      {showDetailsPopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Chi tiết đơn hàng: {showDetailsPopup.listName}
              </h2>
              <button onClick={() => setShowDetailsPopup(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-sm text-gray-500">
                Ngày tạo: {new Date(showDetailsPopup.date).toLocaleString()}
              </p>
              <button
                onClick={() => setEditList(showDetailsPopup)}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
              >
                <Edit2 size={16} />
                Sửa
              </button>
              <button
                onClick={() => handleDeleteList(showDetailsPopup.listID)}
                className="flex items-center gap-1 text-red-500 hover:text-red-600"
              >
                <Trash2 size={16} />
                Xóa
              </button>
            </div>

            {/* Form update thông tin danh sách mua sắm */}
            {editList && editList.listID === showDetailsPopup.listID && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block mb-3">
                  <span className="block mb-1 font-medium">Loại danh sách</span>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={editList.type}
                    onChange={(e) =>
                      setEditList((prev) => ({ ...prev, type: e.target.value }))
                    }
                  >
                    <option value="day">Ngày</option>
                    <option value="week">Tuần</option>
                  </select>
                </label>
                <label className="block mb-3">
                  <span className="block mb-1 font-medium">Ngày</span>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={editList.date}
                    onChange={(e) =>
                      setEditList((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </label>
                <label className="block mb-4">
                  <span className="block mb-1 font-medium">Tên danh sách</span>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editList.listName}
                    onChange={(e) =>
                      setEditList((prev) => ({ ...prev, listName: e.target.value }))
                    }
                  />
                </label>
                <div className="flex justify-end gap-4">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={() => setEditList(null)}
                  >
                    Hủy
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={handleUpdateList}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            )}

            {/* Danh sách sản phẩm */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Danh sách sản phẩm</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAddProductPopup(true);
                      fetchAvailableProducts();
                    }}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Plus size={16} />
                    Chọn sản phẩm có sẵn
                  </button>
                  <button
                    onClick={() => setShowCustomProductPopup(true)}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Plus size={16} />
                    Thêm mới sản phẩm
                  </button>
                </div>
              </div>
              {(showDetailsPopup.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleItemDone(showDetailsPopup.listID, item.id)}
                      className="w-4 h-4"
                    />
                    <span className={item.done ? "line-through text-gray-400" : ""}>
                      {item.name} (x{item.quantity})
                    </span>
                  </div>
                  <span>{item.price ? `${item.price} VND` : "Chưa có giá"}</span>
                </div>
              ))}
              {(!showDetailsPopup.items || showDetailsPopup.items.length === 0) && (
                <p className="text-gray-500">Chưa có sản phẩm trong danh sách.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thêm sản phẩm có sẵn */}
      {showAddProductPopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chọn từ sản phẩm có sẵn</h2>
              <button onClick={() => setShowAddProductPopup(false)}>
                <X size={24} />
              </button>
            </div>
            {productLoading ? (
              <div className="text-center text-gray-500">Đang tải sản phẩm...</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableProducts.map((product) => (
                  <button
                    key={product.id}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded"
                    onClick={() => handleAddProduct(product)}
                  >
                    {product.name} - {product.price} VND
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thêm sản phẩm không có sẵn */}
      {showCustomProductPopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Thêm mới sản phẩm</h2>
              <button onClick={() => setShowCustomProductPopup(false)}>
                <X size={24} />
              </button>
            </div>
            <label className="block mb-3">
              <span className="block mb-1 font-medium">Tên sản phẩm</span>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>
            <label className="block mb-3">
              <span className="block mb-1 font-medium">Giá</span>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </label>
            <label className="block mb-4">
              <span className="block mb-1 font-medium">Số lượng</span>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={newProduct.quantity}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, quantity: e.target.value }))
                }
              />
            </label>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowCustomProductPopup(false)}
              >
                Hủy
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => handleAddProduct(newProduct)}
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;