import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Shield,
  Mail,
  Calendar,
  Filter,
} from "lucide-react";

// Mock data for users
const mockUsers = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    email: "an.nguyen@example.com",
    role: "admin",
    familyId: "family-1",
    familyName: "Gia đình Nguyễn",
    status: "active",
    createdAt: new Date("2024-01-15"),
    lastLogin: new Date("2024-06-01"),
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    email: "binh.tran@example.com",
    role: "user",
    familyId: "family-1",
    familyName: "Gia đình Nguyễn",
    status: "active",
    createdAt: new Date("2024-02-20"),
    lastLogin: new Date("2024-05-30"),
  },
  {
    id: "3",
    name: "Lê Văn Cường",
    email: "cuong.le@example.com",
    role: "user",
    familyId: "family-2",
    familyName: "Gia đình Lê",
    status: "inactive",
    createdAt: new Date("2024-03-10"),
    lastLogin: new Date("2024-04-15"),
  },
  {
    id: "4",
    name: "Phạm Thị Dung",
    email: "dung.pham@example.com",
    role: "admin",
    familyId: "family-2",
    familyName: "Gia đình Lê",
    status: "active",
    createdAt: new Date("2024-01-05"),
    lastLogin: new Date("2024-06-02"),
  },
];

const AccountManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.familyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user
      )
    );

    const user = users.find((u) => u.id === userId);
    alert(
      `Đã ${
        user?.status === "active" ? "vô hiệu hóa" : "kích hoạt"
      } tài khoản ${user?.name}`
    );
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    alert(`Đã xóa tài khoản ${user?.name}`);
  };

  const handleChangeRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    const user = users.find((u) => u.id === userId);
    alert(
      `Đã thay đổi vai trò của ${user?.name} thành ${
        newRole === "admin" ? "Admin" : "Người dùng"
      }`
    );
  };

  const getRoleColor = (role) => {
    return role === "admin"
      ? "bg-red-100 text-red-800"
      : "bg-blue-100 text-blue-800";
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Tài Khoản</h1>
          <p className="text-gray-500 mt-2">
            Quản lý người dùng và phân quyền trong hệ thống
          </p>
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          onClick={() => {}}
        >
          <Plus className="h-4 w-4" />
          Thêm Người Dùng
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Tổng Người Dùng
            </h3>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{users.length}</div>
          <p className="text-xs text-gray-500 mt-1">+2 từ tháng trước</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">Quản Trị Viên</h3>
            <Shield className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === "admin").length}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round(
              (users.filter((u) => u.role === "admin").length / users.length) *
                100
            )}
            % tổng số
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Đang Hoạt Động
            </h3>
            <UserCheck className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">
            {users.filter((u) => u.status === "active").length}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round(
              (users.filter((u) => u.status === "active").length /
                users.length) *
                100
            )}
            % tổng số
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">Số Gia Đình</h3>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">
            {new Set(users.map((u) => u.familyId)).size}
          </div>
          <p className="text-xs text-gray-500 mt-1">Nhóm đang hoạt động</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ Lọc và Tìm Kiếm
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tên, email, gia đình..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="user">Người dùng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              &nbsp;
            </label>
            <button
              className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Danh Sách Người Dùng</h3>
          <p className="text-sm text-gray-500">
            Hiển thị {filteredUsers.length} trong tổng số {users.length} người
            dùng
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Người dùng</th>
                <th className="text-left py-3 px-4">Gia đình</th>
                <th className="text-left py-3 px-4">Vai trò</th>
                <th className="text-left py-3 px-4">Trạng thái</th>
                <th className="text-left py-3 px-4">Đăng nhập lần cuối</th>
                <th className="text-left py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-800">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{user.familyName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {user.lastLogin.toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <select
                        className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={user.role}
                        onChange={(e) =>
                          handleChangeRole(user.id, e.target.value)
                        }
                      >
                        <option value="user">Người dùng</option>
                        <option value="admin">Quản trị viên</option>
                      </select>

                      <button
                        className="p-1 border rounded hover:bg-gray-50"
                        onClick={() => handleToggleUserStatus(user.id)}
                      >
                        {user.status === "active" ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        className="p-1 border rounded hover:bg-gray-50"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
