import React from "react";

const Profile = () => {
  const user = {
    fullName: "Nguyen Van A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
    address: "2 Đ.Giải Phóng, Bách Khoa, Hai Bà Trưng, Hà Nội, Việt Nam",
    joinedDate: "2024-01-15",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Hồ sơ cá nhân</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="text-sm text-gray-500">Họ và tên</label>
          <p className="text-lg font-medium">{user.fullName}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="text-lg font-medium">{user.email}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Số điện thoại</label>
          <p className="text-lg font-medium">{user.phone}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Địa chỉ</label>
          <p className="text-lg font-medium">{user.address}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Thành viên từ</label>
          <p className="text-lg font-medium">{user.joinedDate}</p>
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
