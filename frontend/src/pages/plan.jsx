import React, { useState } from "react";
import { Plus, Save, Pencil, CalendarPlus } from "lucide-react";

const days = ["Th 7", "CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6"];
const dates = [17, 18, 19, 20, 21, 22, 23];

const Plans = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">Lập kế hoạch bữa ăn</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm">
            <CalendarPlus size={16} /> Lập kế hoạch mới
          </button>
          <button
            className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-100"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil size={16} /> Chỉnh sửa
          </button>
          <button className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-100">
            <Save size={16} /> Lưu
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button className="border px-3 py-1 rounded">←</button>
        <span className="font-medium">tháng 5 năm 2025</span>
        <button className="border px-3 py-1 rounded">→</button>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-6">
        {dates.map((date, index) => (
          <div key={index} className="text-center">
            <div
              className={`text-sm ${
                date === 17 ? "text-green-600 font-bold" : "text-gray-500"
              }`}
            >
              {date}
            </div>
            <div className="text-sm font-medium">{days[index]}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4 mb-8">
        {Array.from({ length: 21 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-50 border rounded flex items-center justify-center text-gray-500 text-sm cursor-pointer hover:bg-gray-100"
          >
            <Plus size={16} /> Thêm
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Tổng hợp kế hoạch tuần</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Rau củ quả</h3>
            <ul className="list-disc list-inside">
              <li>Cà chua (5 quả)</li>
              <li>Đậu bắp (200g)</li>
              <li>Rau ngò gai (2 bó)</li>
              <li>Rau xà lách (200g)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Thịt/Cá/Hải sản</h3>
            <ul className="list-disc list-inside">
              <li>Cá lóc (1kg)</li>
              <li>Thịt ba chỉ (500g)</li>
              <li>Tôm (300g)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Khác</h3>
            <ul className="list-disc list-inside">
              <li>Trứng gà (10 quả)</li>
              <li>Nước dừa (500ml)</li>
              <li>Bánh tráng (1 gói)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
