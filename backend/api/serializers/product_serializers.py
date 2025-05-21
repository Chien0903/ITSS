from rest_framework import serializers
from ..models import Categories, ProductCatalog, AddToFridge

class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ['categoryID', 'categoryName']
        read_only_fields = ['categoryID']

class ProductCatalogSerializer(serializers.ModelSerializer):
    category = CategoriesSerializer(source='categoryID', read_only=True)

    class Meta:
        model = ProductCatalog
        fields = ['productID', 'productName', 'price', 'unit', 'shelfLife', 'isCustom', 'categoryID', 'category']
        read_only_fields = ['productID']

class AddToFridgeSerializer(serializers.ModelSerializer):
    product = ProductCatalogSerializer(source='productID', read_only=True)

    class Meta:
        model = AddToFridge
        fields = ['fridgeID', 'productID', 'quantity', 'dateAdded', 'location', 'expiredDate', 'product']
        read_only_fields = ['dateAdded']
