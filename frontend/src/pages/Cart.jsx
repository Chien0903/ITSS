import React from "react";

const Cart = () => {
  // Lấy giỏ hàng từ localStorage, giả sử lưu dưới dạng mảng các object {id, name, quantity, price}
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-4">🛒 Giỏ hàng của bạn</h1>
      {cart.length === 0 ? (
        <div className="text-gray-500">Giỏ hàng của bạn đang trống.</div>
      ) : (
        <>
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Tên sản phẩm</th>
                <th className="text-center py-2">Số lượng</th>
                <th className="text-right py-2">Giá</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.name}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">
                    {item.price.toLocaleString()}₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right font-bold text-lg">
            Tổng cộng: {total.toLocaleString()}₫
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
