import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const pieData = [
  { name: "Rau củ", value: 1000000 },
  { name: "Thịt", value: 900000 },
  { name: "Hải sản", value: 600000 },
];

const barData = [
  { name: "Tháng 1", amount: 1000000 },
  { name: "Tháng 2", amount: 1100000 },
  { name: "Tháng 3", amount: 950000 },
  { name: "Tháng 4", amount: 1250000 },
  { name: "Tháng 5", amount: 1080000 },
];

const colors = ["#00C49F", "#FFBB28", "#FF8042"];

const Statistics = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Thống kê</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">Tổng chi tiêu</p>
          <p className="text-2xl font-bold">2.500.000 đ</p>
          <p className="text-green-500 text-sm">+5% so với tháng trước</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">Chi tiêu trung bình/ngày</p>
          <p className="text-2xl font-bold">83.333 đ</p>
          <p className="text-red-500 text-sm">-2% so với tháng trước</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">Tổng sản phẩm lãng phí</p>
          <p className="text-2xl font-bold">5</p>
          <p className="text-green-500 text-sm">-3 so với tháng trước</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">Tiết kiệm được</p>
          <p className="text-2xl font-bold">300.000 đ</p>
          <p className="text-green-500 text-sm">+15% so với tháng trước</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Chi tiêu theo danh mục</h2>
          <p className="text-sm text-gray-500 mb-4">Tổng chi tiêu phân theo loại thực phẩm</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={100}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Chi tiêu theo tháng</h2>
          <p className="text-sm text-gray-500 mb-4">Xu hướng chi tiêu qua các tháng</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#000000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
