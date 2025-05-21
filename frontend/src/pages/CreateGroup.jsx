import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Danh sách giả lập người dùng
const dummyUsers = [
  { id: 1, name: "Nguyễn Văn A" },
  { id: 2, name: "Trần Thị B" },
  { id: 3, name: "Lê Văn C" },
  { id: 4, name: "Phạm Thị D" },
  { id: 5, name: "Đỗ Văn E" },
];

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const navigate = useNavigate();

  const handleAddUser = (user) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert("Vui lòng nhập tên nhóm.");
      return;
    }

    const groupId = `${groupName
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}`;
    localStorage.setItem("selectedGroup", groupId);

    // 👉 Có thể lưu thông tin nhóm vào localStorage hoặc gửi API tại đây
    console.log("Tạo nhóm:", groupName, selectedUsers);

    navigate("/"); // Về Dashboard sau khi tạo nhóm
  };

  const filteredUsers = dummyUsers.filter((user) =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Tạo Nhóm Mới</h2>

        <input
          type="text"
          placeholder="Tên nhóm"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-4"
        />

        <input
          type="text"
          placeholder="Tìm người dùng để thêm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full border rounded px-4 py-2 mb-4"
        />

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Người dùng gợi ý:</h3>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center px-3 py-1 border rounded cursor-pointer hover:bg-gray-50"
                onClick={() => handleAddUser(user)}
              >
                <span>{user.name}</span>
                <button className="text-sm text-green-600">+ Thêm</button>
              </div>
            ))}
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Đã chọn:</h3>
            <ul className="space-y-1">
              {selectedUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex justify-between items-center px-3 py-1 border rounded"
                >
                  <span>{user.name}</span>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-sm text-red-500"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleCreateGroup}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Tạo Nhóm
        </button>
      </div>
    </div>
  );
};

export default CreateGroup;
