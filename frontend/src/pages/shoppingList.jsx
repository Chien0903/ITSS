import React, { useState, useEffect } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import api from "../api";

const ShoppingList = () => {
  const [lists, setLists] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newList, setNewList] = useState({
    listName: "",
    type: "day",
    date: "",
  });

  const groupID = localStorage.getItem("selectedGroup");
  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user.id;

  //debug
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

  const handleCreate = async () => {
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
      user: userID
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
                {new Date(list.date).toLocaleDateString()}
              </p>
              <div className="mt-3">
                <p className="text-sm font-medium mb-1">
                  Tiến độ: {list.progress ?? 0}%
                </p>
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
                    className={`flex items-center gap-2 ${
                      item.done ? "line-through text-gray-400" : ""
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${item.color || "bg-gray-300"}`}
                    ></span>
                    {item.name}
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 text-sm rounded-md py-2">
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
          className="absolute top-16 right-6 bg-white rounded-lg shadow-lg p-6 w-80 z-50"
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          <h2 className="text-xl font-semibold mb-4">Tạo danh sách mới</h2>

          <label className="block mb-3">
            <span className="block mb-1 font-medium">Loại danh sách</span>
            <select
              className="w-full border rounded px-3 py-2"
              value={newList.type}
              onChange={(e) =>
                setNewList((prev) => ({ ...prev, type: e.target.value }))
              }
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
              onChange={(e) =>
                setNewList((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </label>

          <label className="block mb-4">
            <span className="block mb-1 font-medium">Tên danh sách</span>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Nhập tên danh sách"
              value={newList.listName}
              onChange={(e) =>
                setNewList((prev) => ({ ...prev, listName: e.target.value }))
              }
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
              onClick={handleCreate}
            >
              Tạo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
