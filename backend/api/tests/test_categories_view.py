import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from ..models.categories import Categories

# Đánh dấu tất cả các test trong file này cần truy cập database
pytestmark = pytest.mark.django_db

@pytest.fixture
def api_client():
    """Fixture để tạo một instance của APIClient."""
    return APIClient()

@pytest.fixture
def create_category():
    """Fixture để tạo một category mẫu trong database."""
    category = Categories.objects.create(name='Electronics', description='Gadgets and devices')
    return category

class TestCategoriesView:
    """Test suite cho CategoriesView (GET list và POST)."""

    def test_get_all_categories(self, api_client, create_category):
        """
        Kiểm tra GET /api/categories/ trả về danh sách các categories.
        """
        url = reverse('categories-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['name'] == create_category.name

    def test_create_category_success(self, api_client):
        """
        Kiểm tra POST /api/categories/ tạo thành công một category mới.
        """
        url = reverse('categories-list')
        data = {'name': 'Books', 'description': 'All kinds of books'}
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert Categories.objects.count() == 1
        assert Categories.objects.get().name == 'Books'
        assert response.data['message'] == 'Danh mục đã được thêm thành công'
        assert response.data['data']['name'] == 'Books'

    def test_create_category_invalid_data(self, api_client):
        """
        Kiểm tra POST /api/categories/ với dữ liệu không hợp lệ (thiếu 'name').
        """
        url = reverse('categories-list')
        data = {'description': 'Missing name'}
        response = api_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Categories.objects.count() == 0
        assert 'errors' in response.data
        assert 'name' in response.data['errors']


class TestCategoriesDetailView:
    """Test suite cho CategoriesDetailView (GET detail, PUT, DELETE)."""

    def test_get_category_detail_success(self, api_client, create_category):
        """
        Kiểm tra GET /api/categories/{pk}/ trả về chi tiết một category.
        """
        url = reverse('categories-detail', kwargs={'pk': create_category.pk})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == create_category.name

    def test_get_category_detail_not_found(self, api_client):
        """
        Kiểm tra GET /api/categories/{pk}/ với pk không tồn tại.
        """
        url = reverse('categories-detail', kwargs={'pk': 999})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['message'] == 'Không tìm thấy danh mục'

    def test_update_category_success(self, api_client, create_category):
        """
        Kiểm tra PUT /api/categories/{pk}/ cập nhật thành công một category.
        """
        url = reverse('categories-detail', kwargs={'pk': create_category.pk})
        data = {'name': 'Updated Electronics', 'description': 'Updated description'}
        response = api_client.put(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['message'] == 'Danh mục đã được cập nhật thành công'
        assert response.data['data']['name'] == 'Updated Electronics'
        
        # Kiểm tra xem dữ liệu trong DB đã được cập nhật chưa
        create_category.refresh_from_db()
        assert create_category.name == 'Updated Electronics'

    def test_update_category_not_found(self, api_client):
        """
        Kiểm tra PUT /api/categories/{pk}/ với pk không tồn tại.
        """
        url = reverse('categories-detail', kwargs={'pk': 999})
        data = {'name': 'Wont work'}
        response = api_client.put(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_category_invalid_data(self, api_client, create_category):
        """
        Kiểm tra PUT /api/categories/{pk}/ với dữ liệu không hợp lệ (name rỗng).
        """
        url = reverse('categories-detail', kwargs={'pk': create_category.pk})
        data = {'name': ''}
        response = api_client.put(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data

    def test_delete_category_success(self, api_client, create_category):
        """
        Kiểm tra DELETE /api/categories/{pk}/ xóa thành công một category.
        """
        assert Categories.objects.count() == 1
        url = reverse('categories-detail', kwargs={'pk': create_category.pk})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_200_OK # Đã sửa ở view
        assert response.data['message'] == 'Danh mục đã được xóa thành công'
        assert Categories.objects.count() == 0

    def test_delete_category_not_found(self, api_client):
        """
        Kiểm tra DELETE /api/categories/{pk}/ với pk không tồn tại.
        """
        url = reverse('categories-detail', kwargs={'pk': 999})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND