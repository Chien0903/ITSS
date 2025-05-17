
import React from "react";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng Ký</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Họ tên" className="w-full px-4 py-2 border rounded" required />
          <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded" required />
          <input type="password" placeholder="Mật khẩu" className="w-full px-4 py-2 border rounded" required />
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
            Đăng Ký
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Đã có tài khoản? <a href="/login" className="text-green-500 hover:underline">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
