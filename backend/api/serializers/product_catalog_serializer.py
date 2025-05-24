from rest_framework import serializers
from ..models.product_catalog import ProductCatalog

class ProductCatalogSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.categoryName', read_only=True)
    
    class Meta:
        model = ProductCatalog
        fields = '__all__'
           
        read_only_fields = ['productID', 'created_at', 'updated_at'] 