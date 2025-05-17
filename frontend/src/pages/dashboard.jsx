import React from "react";

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Xin chào!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">Sản phẩm sắp hết hạn</div>
        <div className="bg-white p-4 rounded shadow">Tổng chi tiêu</div>
        <div className="bg-white p-4 rounded shadow">Đã tiết kiệm</div>
        <div className="bg-white p-4 rounded shadow">Đồ đã hết hạn</div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Thực đơn hôm nay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
          <div className="p-3 bg-gray-50 rounded border"><strong>Bữa sáng</strong><br />Bánh mì trứng</div>
          <div className="p-3 bg-gray-50 rounded border"><strong>Bữa trưa</strong><br />Canh chua cá lóc</div>
          <div className="p-3 bg-gray-50 rounded border"><strong>Bữa tối</strong><br />Thịt kho tàu</div>
        </div>
        <button className="mt-2 px-4 py-2 bg-white border rounded hover:bg-gray-100">📅 Xem kế hoạch bữa ăn</button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Mua sắm thường xuyên</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["Thịt heo", "Rau cải", "Trứng gà", "Gạo"].map((item, i) => (
            <div key={i}>
              <div className="text-sm font-medium mb-1">{item}</div>
              <div className="h-2 bg-green-400 rounded-full w-full"></div>
              <div className="text-xs text-gray-500 mt-1">{12 - i * 2} lần</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
