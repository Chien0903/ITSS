import React from "react";
import { useNavigate } from "react-router-dom";

const dummyGroups = [
  { id: "1", name: "Thích ăn chuối" },
  { id: "2", name: "Thích ăn nho" },
];

const SelectGroup = () => {
  const navigate = useNavigate();

  const handleSelectGroup = (groupId) => {
    localStorage.setItem("selectedGroup", groupId);
    navigate("/");
  };

  const handleCreateGroup = () => {
    navigate("/create-group");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-xl bg-white shadow-md rounded p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Chọn Nhóm</h2>
        <div className="space-y-4">
          {dummyGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleSelectGroup(group.id)}
              className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 cursor-pointer"
            >
              <span className="font-medium text-lg">{group.name}</span>
              <span className="text-xl text-gray-400">→</span>
            </div>
          ))}

          {/* Mục tạo nhóm mới */}
          <div
            onClick={handleCreateGroup}
            className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 cursor-pointer bg-green-50"
          >
            <span className="font-medium text-green-700">+ Tạo nhóm mới</span>
            <span className="text-xl text-green-600">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectGroup;
