
import React from "react";
import { ShoppingCart } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Thịt heo ba chỉ",
    image: "/images/pork.jpg",
    category: "Thịt",
    description: "Thịt heo ba chỉ tươi, nguồn gốc rõ ràng",
    price: 105000,
    oldPrice: 120000,
    unit: "/kg",
    rating: 4.8,
    discount: "13%",
  },
  {
    id: 2,
    name: "Rau cải ngọt",
    image: "/images/vegetable.jpg",
    category: "Rau củ",
    description: "Rau cải ngọt hữu cơ, không thuốc trừ sâu",
    price: 15000,
    unit: "/bó",
    rating: 4.5,
  },
  {
    id: 3,
    name: "Cá thu",
    image: "/images/fish.jpg",
    category: "Hải sản",
    description: "Cá thu tươi, đánh bắt từ biển",
    price: 75000,
    oldPrice: 85000,
    unit: "/kg",
    rating: 4.7,
    discount: "12%",
  },
  {
    id: 4,
    name: "Gạo ST25",
    image: "/images/rice.jpg",
    category: "Ngũ cốc",
    description: "Gạo ST25 chất lượng cao, đạt giải gạo ngon nhất thế giới",
    price: 35000,
    unit: "/kg",
    rating: 4.9,
  },
  {
    id: 5,
    name: "Táo Envy",
    image: "/images/apple.jpg",
    category: "Trái cây",
    description: "Táo Envy nhập khẩu New Zealand, giòn ngọt",
    price: 75000,
    unit: "/kg",
    rating: 4.6,
  },
  {
    id: 6,
    name: "Sữa tươi Vinamilk",
    image: "/images/milk.jpg",
    category: "Sữa và trứng",
    description: "Sữa tươi tiệt trùng Vinamilk không đường",
    price: 28000,
    unit: "/hộp",
    rating: 4.5,
  },
  {
    id: 7,
    name: "Trứng gà ta",
    image: "/images/egg.jpg",
    category: "Sữa và trứng",
    description: "Trứng gà ta từ gà thả vườn",
    price: 40000,
    oldPrice: 45000,
    unit: "/vỉ (10 trứng)",
    rating: 4.7,
    discount: "11%",
  },
  {
    id: 8,
    name: "Tiêu đen Phú Quốc",
    image: "/images/pepper.jpg",
    category: "Gia vị",
    description: "Tiêu đen Phú Quốc có chỉ dẫn địa lý",
    price: 120000,
    unit: "/hộp 100g",
    rating: 4.8,
  },
];

const Store = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Cửa hàng thực phẩm</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-4 relative">
            {product.discount && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                Giảm {product.discount}
              </span>
            )}
            <div className="h-40 bg-gray-100 flex items-center justify-center mb-4">
              <img src={product.image} alt={product.name} className="max-h-full" />
            </div>
            <div className="text-sm text-gray-500 mb-1">
              <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">{product.category}</span>
            </div>
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">{product.description}</p>
            <div className="mt-2 text-base font-semibold">
              {product.price.toLocaleString()}đ <span className="text-sm text-gray-400 font-normal line-through">{product.oldPrice?.toLocaleString()}đ</span>
              <span className="text-sm text-gray-500">{product.unit}</span>
            </div>
            <button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white text-sm py-2 rounded flex items-center justify-center gap-2">
              <ShoppingCart size={16} />
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;
