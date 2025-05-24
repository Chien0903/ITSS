import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      // Thử lấy từ API trước
      const response = await api.get("/api/user/me/");
      setUser(response.data.user);
    } catch (err) {
      // Nếu API lỗi, thử lấy từ localStorage
      console.error("Lỗi khi gọi API user info:", err);
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } else {
          setError(
            "Không thể tải thông tin người dùng. Vui lòng đăng nhập lại."
          );
          navigate("/login");
        }
      } catch (localStorageError) {
        console.error("Lỗi khi lấy thông tin user:", localStorageError);
        setError("Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center">Đang tải thông tin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center text-red-500">
          Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Hồ sơ cá nhân</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="text-sm text-gray-500">Họ và tên</label>
          <p className="text-lg font-medium">{user.name || "Chưa cập nhật"}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="text-lg font-medium">{user.email || "Chưa cập nhật"}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Username</label>
          <p className="text-lg font-medium">
            {user.username || "Chưa cập nhật"}
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-500">ID</label>
          <p className="text-lg font-medium">{user.id || "N/A"}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Vai trò</label>
          <p className="text-lg font-medium">{user.role || "Người dùng"}</p>
        </div>

        <div className="text-right">
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
