from rest_framework import serializers
from ..models.add_to_list import AddToList
from ..models.shopping_list import ShoppingList
from .product_catalog import ProductCatalogSerializer

class AddToListSerializer(serializers.ModelSerializer):
    product = ProductCatalogSerializer(source='productID', read_only=True)
    
    class Meta:
        model = AddToList
        fields = ['listID', 'productID', 'quantity', 'status', 'product']

class ShoppingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingList
        fields = ['listID', 'createdAt', 'listName', 'date', 'groupID', 'userID', 'type']
        read_only_fields = ['listID', 'createdAt']
        