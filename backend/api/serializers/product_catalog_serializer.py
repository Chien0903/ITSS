from rest_framework import serializers
from ..models.product_catalog import ProductCatalog

class ProductCatalogSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.categoryName', read_only=True)
    
    class Meta:
        model = ProductCatalog
        fields = [
            'productID', 'productName', 'price', 'unit', 
            'shelfLife', 'isCustom', 'category', 'category_name',
            'image', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['productID', 'created_at', 'updated_at'] 