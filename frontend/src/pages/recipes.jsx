
import React from "react";

const recipes = [
  {
    id: 1,
    title: "Canh chua cá lóc",
    image: "/images/canh-chua.jpg",
    tags: ["canh", "món Việt", "chua ngọt"],
    time: "40 phút",
    people: 4,
    liked: true,
  },
  {
    id: 2,
    title: "Thịt kho tàu",
    image: "/images/thit-kho.jpg",
    tags: ["món kho", "món Việt", "ngày Tết"],
    time: "90 phút",
    people: 6,
    liked: true,
  },
  {
    id: 3,
    title: "Gỏi cuốn",
    image: "/images/goi-cuon.jpg",
    tags: ["món cuốn", "món nhẹ", "dễ làm"],
    time: "35 phút",
    people: 3,
    liked: false,
  },
];

const Recipes = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Công thức nấu ăn</h1>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm rounded-lg">
          Gợi ý từ tủ lạnh
        </button>
      </div>

      <input
        type="text"
        placeholder="Tìm kiếm công thức, nguyên liệu..."
        className="w-full border rounded-lg px-4 py-2 mb-6"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow p-4">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-40 object-cover rounded mb-3"
            />
            <h2 className="text-xl font-semibold mb-1">{recipe.title}</h2>
            <p className="text-gray-500 text-sm mb-2">
              Mô tả món ăn sẽ hiển thị tại đây.
            </p>
            <div className="flex flex-wrap gap-2 text-xs mb-2">
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>⏱ {recipe.time}</span>
              <span>👤 {recipe.people} người</span>
            </div>
            <button className="mt-3 w-full text-sm text-center border rounded py-1 hover:bg-gray-100">
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
