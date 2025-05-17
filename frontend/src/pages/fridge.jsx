
import React from "react";

const fridgeItems = [
  {
    id: 1,
    name: "Thịt gà",
    quantity: "800 g",
    addedAt: "5/5/2023",
    status: "expired",
  },
  {
    id: 2,
    name: "Cà rốt",
    quantity: "500 g",
    addedAt: "4/5/2023",
    status: "expired",
  },
  {
    id: 3,
    name: "Sữa chua",
    quantity: "4 hộp",
    addedAt: "3/5/2023",
    status: "expired",
  },
];

const Fridge = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Quản lý tủ lạnh</h1>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
          + Thêm sản phẩm mới
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Tổng sản phẩm</p>
          <p className="text-2xl font-semibold">5</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Sản phẩm sắp hết hạn</p>
          <p className="text-2xl font-semibold text-yellow-500">0</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Sản phẩm đã hết hạn</p>
          <p className="text-2xl font-semibold text-red-500">5</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Phân loại phổ biến</p>
          <p className="text-2xl font-semibold">Rau củ</p>
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
        <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded">Tủ lạnh</button>
        <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded">Ngăn đông</button>
        <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded">Tủ bếp</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fridgeItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-red-300 p-4 rounded shadow relative"
          >
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.quantity}</p>
            <p className="text-sm text-gray-400 mt-1">Thêm vào: {item.addedAt}</p>
            <p className="text-sm text-red-500 mt-2 font-medium">⚠ Đã hết hạn!</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fridge;
