import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

const SelectGroup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlightId, setHighlightId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchGroups();
    if (location.state && location.state.newGroupId) {
      setHighlightId(location.state.newGroupId);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get("/api/groups/");
      setGroups(response.data);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải danh sách nhóm");
      setLoading(false);
    }
  };

  const handleSelectGroup = (groupId) => {
    localStorage.setItem("selectedGroup", groupId);
    navigate("/");
  };

  const handleCreateGroup = () => {
    navigate("/create-group");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-xl bg-white shadow-md rounded p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Chọn Nhóm</h2>
        {showSuccess && (
          <div className="mb-4 text-green-600 text-center font-medium">
            Tạo nhóm thành công! Hãy chọn nhóm để bắt đầu.
          </div>
        )}
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.groupID}
              onClick={() => handleSelectGroup(group.groupID)}
              className={`flex items-center justify-between p-4 border rounded hover:bg-gray-50 cursor-pointer ${
                highlightId === group.groupID
                  ? "border-green-500 bg-green-50"
                  : ""
              }`}
            >
              <div>
                <span className="font-medium text-lg">{group.groupName}</span>
                <p className="text-sm text-gray-500">
                  {group.member_count} thành viên
                </p>
              </div>
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
