from rest_framework import serializers
from ..models.shopping_list import ShoppingList
from ..models.add_to_list import AddToList

class ShoppingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingList
        fields = '__all__'
        read_only_fields = ['listID', 'createdAt']

class AddToListSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productName", read_only=True)
    list_name = serializers.CharField(source="list.listName", read_only = True)
    class Meta:
        model = AddToList
        fields = '__all__'
        read_only_fields = ['product_name', 'list_name']