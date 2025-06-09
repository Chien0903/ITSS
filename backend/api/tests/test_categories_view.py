# /tests/test_categories_views.py

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models.categories import Categories
from ..serializers.categories_serializer import CategoriesSerializer

# =================================================================
# Test cho CategoriesView (GET list và POST create)
# =================================================================
class CategoriesViewTest(APITestCase):

    def setUp(self):
        """Hàm này chạy trước mỗi test, dùng để khởi tạo dữ liệu mẫu."""
        Categories.objects.create(name='Electronics', description='Gadgets and devices')
        Categories.objects.create(name='Books', description='Paperback and hardcover')
        self.list_url = reverse('category-list') # Lấy URL từ tên 'category-list'

    def test_get_all_categories(self):
        """Kiểm tra việc lấy danh sách tất cả các danh mục."""
        response = self.client.get(self.list_url)
        
        # Lấy tất cả danh mục từ DB để so sánh
        categories = Categories.objects.all()
        serializer = CategoriesSerializer(categories, many=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(len(response.data), 2)

    def test_create_valid_category(self):
        """Kiểm tra việc tạo một danh mục mới với dữ liệu hợp lệ."""
        payload = {'name': 'Fashion', 'description': 'Clothing and accessories'}
        response = self.client.post(self.list_url, payload, format='json')
        
        # Kiểm tra response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Danh mục đã được thêm thành công')
        self.assertEqual(response.data['data']['name'], 'Fashion')

        # Kiểm tra xem danh mục đã thực sự được tạo trong DB chưa
        self.assertTrue(Categories.objects.filter(name='Fashion').exists())

    def test_create_invalid_category(self):
        """Kiểm tra việc tạo một danh mục mới với dữ liệu không hợp lệ (thiếu 'name')."""
        payload = {'description': 'This should fail'}
        response = self.client.post(self.list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Có lỗi xảy ra khi thêm danh mục')
        self.assertIn('name', response.data['errors']) # Kiểm tra xem lỗi có phải do trường 'name' không

# =================================================================
# Test cho CategoriesDetailView (GET, PUT, DELETE theo pk)
# =================================================================
class CategoriesDetailViewTest(APITestCase):

    def setUp(self):
        """Hàm này chạy trước mỗi test, dùng để khởi tạo dữ liệu mẫu."""
        self.category1 = Categories.objects.create(name='Technology', description='All about tech')
        self.valid_payload = {'name': 'Updated Tech', 'description': 'An updated description'}
        self.invalid_payload = {'name': '', 'description': 'Invalid name'}

    def test_get_valid_single_category(self):
        """Kiểm tra việc lấy thông tin chi tiết một danh mục hợp lệ."""
        detail_url = reverse('category-detail', kwargs={'pk': self.category1.pk})
        response = self.client.get(detail_url)
        
        serializer = CategoriesSerializer(self.category1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_get_invalid_single_category(self):
        """Kiểm tra việc lấy thông tin một danh mục không tồn tại."""
        invalid_url = reverse('category-detail', kwargs={'pk': 999})
        response = self.client.get(invalid_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'Không tìm thấy danh mục')

    def test_valid_update_category(self):
        """Kiểm tra việc cập nhật một danh mục với dữ liệu hợp lệ."""
        detail_url = reverse('category-detail', kwargs={'pk': self.category1.pk})
        response = self.client.put(detail_url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['name'], 'Updated Tech')

        # Kiểm tra xem dữ liệu trong DB đã được cập nhật chưa
        self.category1.refresh_from_db()
        self.assertEqual(self.category1.name, 'Updated Tech')
        self.assertEqual(self.category1.description, 'An updated description')
        
    def test_invalid_update_category(self):
        """Kiểm tra việc cập nhật một danh mục với dữ liệu không hợp lệ."""
        detail_url = reverse('category-detail', kwargs={'pk': self.category1.pk})
        response = self.client.put(detail_url, self.invalid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Có lỗi xảy ra khi cập nhật danh mục')
        self.assertIn('name', response.data['errors'])

    def test_delete_valid_category(self):
        """Kiểm tra việc xóa một danh mục hợp lệ."""
        detail_url = reverse('category-detail', kwargs={'pk': self.category1.pk})
        response = self.client.delete(detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Kiểm tra xem danh mục đã bị xóa khỏi DB chưa
        with self.assertRaises(Categories.DoesNotExist):
            Categories.objects.get(pk=self.category1.pk)

    def test_delete_invalid_category(self):
        """Kiểm tra việc xóa một danh mục không tồn tại."""
        invalid_url = reverse('category-detail', kwargs={'pk': 999})
        response = self.client.delete(invalid_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'Không tìm thấy danh mục')