from rest_framework import viewsets, status
from rest_framework.response import Response
from ..models.shopping_list import ShoppingList
from ..models.add_to_list import AddToList
from ..serializers.shopping_list import ShoppingListSerializer, AddToListSerializer

#Danh sách mua sắm (tên, ngày tạo,...)
class ShoppingListView(viewsets.ModelViewSet):
    queryset = ShoppingList.objects.all()
    serializer_class = ShoppingListSerializer
#Chi tiết danh sách mua sắm (crud từng sản phẩmphẩm)
class AddToListView(viewsets.ModelViewSet):
    queryset = AddToList
    serializer_class = AddToListSerializer
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            new_status = serializer.validated_data_get('status', old_status)

            if old_status != 'purchased' and new_status == 'purchased':
                return Response({
                    "message": "Sản phẩm đã được đánh dấu là đã mua. Bạn có muốn thêm vào tủ lạnh không?",
                    "next_action": "confirm_add_fridge"
                })
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    