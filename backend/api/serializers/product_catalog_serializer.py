from rest_framework import serializers
from ..models.product_catalog import ProductCatalog

class ProductCatalogSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.categoryName', read_only=True)
    estimatedPrice = serializers.DecimalField(source='price', max_digits=10, decimal_places=2, read_only=True)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = ProductCatalog
        fields = [
            'productID', 
            'productName', 
            'original_price',
            'price', 
            'discount',
            'discount_amount',
            'discount_percentage',
            'estimatedPrice',
            'unit',
            'category', 
            'category_name',
            'image', 
            'description',
            'shelfLife',
            'isCustom'
        ]
        read_only_fields = ['productID', 'price', 'discount_amount', 'discount_percentage']
    
    def create(self, validated_data):
        # Tạo sản phẩm mới với giá được tính tự động
        product = ProductCatalog(**validated_data)
        product.save()  # Method save() sẽ tự động tính price
        return product
    
    def update(self, instance, validated_data):
        # Cập nhật sản phẩm với giá được tính lại
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()  # Method save() sẽ tự động tính lại price
        return instance