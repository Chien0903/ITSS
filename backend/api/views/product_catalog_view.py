from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from ..models.product_catalog import ProductCatalog
from ..serializers.product_catalog_serializer import ProductCatalogSerializer
import cloudinary.uploader


class ProductCatalogView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def get(self, request):
        category_id = request.query_params.get('category', None)
        if category_id:
            products = ProductCatalog.objects.filter(category_id=category_id)
        else:
            products = ProductCatalog.objects.all()
        serializer = ProductCatalogSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        image = request.FILES.get('image')
        if image:
            result = cloudinary.uploader.upload(image)
            request.data['image'] = result['secure_url']

        serializer = ProductCatalogSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            return Response({'message': 'Thành công', 'data': ProductCatalogSerializer(product).data}, status=201)
        return Response(serializer.errors, status=400)

class ProductCatalogDetailView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return ProductCatalog.objects.get(pk=pk)
        except ProductCatalog.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({
                'message': 'Không tìm thấy sản phẩm'
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductCatalogSerializer(product)
        return Response(serializer.data)

    def put(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({
                'message': 'Không tìm thấy sản phẩm'
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductCatalogSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Sản phẩm đã được cập nhật thành công',
                'data': serializer.data
            })
        return Response({
            'message': 'Có lỗi xảy ra khi cập nhật sản phẩm',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({
                'message': 'Không tìm thấy sản phẩm'
            }, status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response({
            'message': 'Sản phẩm đã được xóa thành công'
        }, status=status.HTTP_204_NO_CONTENT) 