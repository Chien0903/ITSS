from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from ..models.cart import Cart, CartItem
from ..models.product_catalog import ProductCatalog
from ..serializers.cart import CartSerializer, CartItemSerializer

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user, is_checked_out=False)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user, is_checked_out=False)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = ProductCatalog.objects.get(pk=product_id)
        except ProductCatalog.DoesNotExist:
            return Response({'error': 'Sản phẩm không tồn tại'}, status=404)

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()

        return Response({'message': 'Đã thêm sản phẩm vào giỏ hàng'}, status=status.HTTP_201_CREATED)

class RemoveFromCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        product_id = request.data.get('product_id')
        cart = Cart.objects.filter(user=request.user, is_checked_out=False).first()

        if not cart:
            return Response({'error': 'Giỏ hàng không tồn tại'}, status=404)

        item = CartItem.objects.filter(cart=cart, product_id=product_id).first()
        if item:
            item.delete()
            return Response({'message': 'Đã xoá sản phẩm khỏi giỏ hàng'})
        return Response({'error': 'Sản phẩm không có trong giỏ hàng'}, status=404)
