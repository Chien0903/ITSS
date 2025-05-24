from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from .product_catalog import ProductCatalog  # Đảm bảo tên file đúng

User = get_user_model()

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_checked_out = models.BooleanField(default=False)  # Nếu đã thanh toán

    def __str__(self):
        return f"Giỏ hàng của {self.user.username} - {self.created_at.strftime('%Y-%m-%d')}"

    def total_price(self):
        return sum(item.total_price() for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(ProductCatalog, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.productName}"

    def total_price(self):
        return self.product.price * self.quantity
