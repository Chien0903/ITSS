import { Plus, ShoppingCart, List } from "lucide-react";

const ShoppingList = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Danh sách mua sắm</h1>
        <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
          <Plus size={18} />
          Tạo danh sách mới
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm danh sách..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button className="bg-gray-200 px-4 py-1 rounded-full font-medium">Đang mua</button>
        <button className="px-4 py-1 rounded-full text-gray-500">Đã hoàn thành</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Danh sách 1 */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold text-lg">Mua đồ cuối tuần</h2>
          <p className="text-sm text-gray-500">Thứ Bảy, 6 tháng 5, 2023</p>
          <div className="mt-3">
            <p className="text-sm font-medium mb-1">Tiến độ: 25%</p>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div className="h-2 bg-green-500 rounded" style={{ width: "25%" }}></div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Thịt heo
            </div>
            <div className="flex items-center gap-2 line-through text-gray-400">
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              Rau cải
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              Trứng gà
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400"></span>
              Gạo
            </div>
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 text-sm rounded-md py-2">
            <ShoppingCart size={16} />
            Chi tiết
          </button>
        </div>

        {/* Danh sách 2 */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold text-lg">Đồ hằng ngày</h2>
          <p className="text-sm text-gray-500">Thứ Tư, 10 tháng 5, 2023</p>
          <div className="mt-3">
            <p className="text-sm font-medium mb-1">Tiến độ: 0%</p>
            <div className="w-full h-2 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              Sữa tươi
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brown-500"></span>
              Bánh mì
            </div>
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 text-sm rounded-md py-2">
            <ShoppingCart size={16} />
            Chi tiết
          </button>
        </div>

        {/* Tạo mới */}
        <div className="border border-dashed rounded-lg flex items-center justify-center text-center text-gray-500">
          <div>
            <Plus className="mx-auto mb-2" />
            <p className="font-semibold">Tạo danh sách mới</p>
            <p className="text-sm">Lên kế hoạch mua sắm ngay</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
