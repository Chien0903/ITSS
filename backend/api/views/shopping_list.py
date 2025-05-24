from rest_framework import viewsets
from ..models.shopping_list import ShoppingList
from ..serializers.shopping_list import ShoppingListSerializer, AddToListSerializer

class ShoppingListView(viewsets.ModelViewSet):
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer