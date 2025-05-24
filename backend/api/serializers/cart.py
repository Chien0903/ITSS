from rest_framework import serializers
from ..models.cart import Cart, CartItem
from ..models.product_catalog import ProductCatalog

class ProductCatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCatalog
        fields = ['productID', 'productName', 'price', 'unit', 'image']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductCatalogSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductCatalog.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'cart']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'updated_at', 'is_checked_out', 'items']
        read_only_fields = ['created_at', 'updated_at']
