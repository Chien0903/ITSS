import React, { useEffect, useState } from "react";
import api from "../api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [shippingFee] = useState(30000);
  const [discountCode, setDiscountCode] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart/");
      setCartItems(res.data.items);
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (item, delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      await removeItem(item.product.id);
      return;
    }

    try {
      await api.put("/api/cart/update/", {
        product_id: item.product.id,
        quantity: newQuantity,
      });
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete("/api/cart/remove/", {
        data: { product_id: productId },
      });
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Lỗi xoá sản phẩm:", err);
    }
  };

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage("Vui lòng nhập mã giảm giá");
      return;
    }

    setApplyingDiscount(true);
    setDiscountMessage("");

    try {
      const mockDiscountCodes = {
        GIAM10: 0.1,
        GIAM50K: 50000,
        FREESHIP: 30000,
      };

      if (mockDiscountCodes[discountCode.toUpperCase()]) {
        const discountValue = mockDiscountCodes[discountCode.toUpperCase()];
        if (discountValue < 1) {
          setDiscount(subtotal * discountValue);
        } else {
          setDiscount(discountValue);
        }
        setDiscountMessage(`Áp dụng mã "${discountCode}" thành công!`);
        setDiscountCode("");
      } else {
        setDiscountMessage("Mã giảm giá không hợp lệ");
        setDiscount(0);
      }
    } catch (err) {
      console.error("Lỗi áp dụng mã giảm giá:", err);
      setDiscountMessage("Có lỗi xảy ra khi áp dụng mã giảm giá");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Logic tính tổng cộng, đảm bảo không âm
  const discountAmount = Math.min(discount, subtotal + shippingFee); // Không giảm quá tổng tiền
  const freeShippingThreshold = 500000;
  const actualShippingFee = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const finalTotal = Math.max(0, subtotal + actualShippingFee - discountAmount);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Giỏ hàng</h1>
      <p className="mb-6">{cartItems.length} sản phẩm</p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Giỏ hàng trống</p>
              <button
                onClick={() => (window.location.href = "/store")}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border p-4 mb-4 rounded shadow-sm bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded" />
                  <div>
                    <h3 className="font-semibold">
                      {item.product.productName}
                    </h3>
                    <p className="text-sm text-gray-500">{item.product.unit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item, -1)}
                      className="px-2 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item, 1)}
                      className="px-2 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {item.product.price.toLocaleString()} ₫
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-700 text-xl"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {cartItems.length > 0 && (
          <div className="w-full lg:w-1/3 bg-white p-4 border rounded shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between text-sm">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Phí vận chuyển</span>
              <span
                className={
                  subtotal >= freeShippingThreshold
                    ? "line-through text-gray-400"
                    : ""
                }
              >
                {shippingFee.toLocaleString()} ₫
              </span>
              {subtotal >= freeShippingThreshold && (
                <span className="text-green-600 ml-2">Miễn phí</span>
              )}
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span>
                <span>-{discountAmount.toLocaleString()} ₫</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span>{finalTotal.toLocaleString()} ₫</span>
            </div>
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded disabled:opacity-50"
              disabled={finalTotal === 0}
            >
              Tiến hành thanh toán
            </button>
            <p className="text-xs text-gray-500">
              Miễn phí vận chuyển cho đơn hàng trên{" "}
              {freeShippingThreshold.toLocaleString()}đ
            </p>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mã giảm giá
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 border px-2 py-1 rounded-l"
                  placeholder="Nhập mã giảm giá"
                />
                <button
                  onClick={applyDiscountCode}
                  disabled={applyingDiscount}
                  className="bg-gray-200 px-4 rounded-r hover:bg-gray-300 disabled:opacity-50"
                >
                  {applyingDiscount ? "..." : "Áp dụng"}
                </button>
              </div>
              {discountMessage && (
                <p
                  className={`text-xs mt-1 ${
                    discountMessage.includes("thành công")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {discountMessage}
                </p>
              )}
              <div className="text-xs text-gray-400 mt-1">
                Mã demo: GIAM10, GIAM50K, FREESHIP
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
