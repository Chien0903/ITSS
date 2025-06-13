
# ===============================================================
# api/tests/test_shopping_lists.py (Corrected)
# ===============================================================

from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, timedelta # Import timedelta
from api.models.shopping_list import ShoppingList
from api.models.add_to_list import AddToList
from api.models.product_catalog import ProductCatalog, Categories
from api.models.group import Group

User = get_user_model()

class ShoppingListTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user1', password='password')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.group = Group.objects.create(groupName='Test Group')
        # Fix: Add the required 'type' field
        self.shopping_list = ShoppingList.objects.create(user=self.user, group=self.group, listName='List B', date=date.today(), type='weekly')

    def test_create_shopping_list(self):
        url = reverse('shopping-list')
        # Fix: Corrected 'groupName' to 'listName' as the payload is for a ShoppingList
        data = {'group': self.group.groupID, 'listName': 'Test List', 'date': date.today().isoformat(), 'type': 'monthly'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['listName'], 'Test List')
        self.assertEqual(response.data['type'], 'monthly')

    def test_get_shopping_lists(self):
        ShoppingList.objects.create(user=self.user, group=self.group, listName='List A', date=date.today(), type='weekly')
        url = reverse('shopping-list')
        response = self.client.get(url, {'group_id': self.group.groupID})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class ShoppingListDetailTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user2', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.group = Group.objects.create(groupName='Another Group')
        # Fix: Add the required 'type' field
        self.shopping_list = ShoppingList.objects.create(user=self.user, group=self.group, listName='List B', date=date.today(), type='one-time')

    def test_get_list_detail(self):
        url = reverse('shopping-list-detail', args=[self.shopping_list.listID])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['listID'], self.shopping_list.listID)
        self.assertEqual(response.data['listName'], 'List B')

    def test_update_shopping_list(self):
        url = reverse('shopping-list-detail', args=[self.shopping_list.listID])
        data = {'listName': 'Updated Name'}
        # Use PATCH for partial updates to avoid sending all fields
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify by reloading the object from the database for reliability
        self.shopping_list.refresh_from_db()
        self.assertEqual(self.shopping_list.listName, 'Updated Name')

    def test_delete_shopping_list(self):
        url = reverse('shopping-list-detail', args=[self.shopping_list.listID])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class AddItemTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user3', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.group = Group.objects.create(groupName='Item Group')
        self.list = ShoppingList.objects.create(user=self.user, group=self.group, listName='List C', date=date.today(), type='event')
        # Fix: Add the required 'shelfLife' field
        self.product = ProductCatalog.objects.create(productName='Milk', price=10, shelfLife=7)

    def test_add_item_to_list(self):
        url = reverse('add-to-list', args=[self.list.listID])
        # Use .pk to get the primary key reliably
        data = {'product': self.product.pk, 'quantity': 2}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quantity'], 2)
        self.assertTrue(AddToList.objects.filter(list=self.list, product=self.product).exists())


class UpdateItemTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user4', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.group = Group.objects.create(groupName='Update Group')
        self.list = ShoppingList.objects.create(user=self.user, group=self.group, listName='List D', date=date.today(), type='weekly')
        self.product = ProductCatalog.objects.create(productName='Egg', price=5, shelfLife=30)
        self.item = AddToList.objects.create(list=self.list, product=self.product, quantity=3)

    def test_update_item_quantity(self):
        """Ensure we can update the quantity of an item in the list."""
        url = reverse('add-to-list-detail', args=[self.list.listID, self.item.id])
        data = {'quantity': 5}
        # Fix: Use PATCH for partial updates, which is better practice.
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify by reloading the object, which is more reliable
        self.item.refresh_from_db()
        self.assertEqual(self.item.quantity, 5)

    def test_delete_item(self):
        """Ensure we can delete an item from the list."""
        url = reverse('add-to-list-detail', args=[self.list.listID, self.item.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(AddToList.objects.filter(id=self.item.id).exists())


class ToggleStatusTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user5', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.group = Group.objects.create(groupName='Toggle Group')
        self.list = ShoppingList.objects.create(user=self.user, group=self.group, listName='List E', date=date.today(), type='weekly')
        self.product = ProductCatalog.objects.create(productName='Rice', price=8, shelfLife=365)
        self.item = AddToList.objects.create(list=self.list, product=self.product, quantity=1, status='pending')

    def test_toggle_status(self):
        url = reverse('toggle-item-status', args=[self.list.listID, self.item.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify by reloading the object
        self.item.refresh_from_db()
        self.assertEqual(self.item.status, 'purchased')


class StatsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user6', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.group = Group.objects.create(groupName='Stats Group')
        self.category = Categories.objects.create(categoryName='Dairy')
        self.product = ProductCatalog.objects.create(productName='Cheese', price=15, category=self.category, shelfLife=60)
        # Fix: Use a specific, known date for the test item
        self.test_date = date(2025, 6, 15)
        self.list = ShoppingList.objects.create(user=self.user, group=self.group, listName='Stats List', date=self.test_date, type='monthly')
        AddToList.objects.create(list=self.list, product=self.product, quantity=3, status='purchased')

    def test_purchased_stats(self):
        url = reverse('purchased-shopping-stats')
        # Fix: Create a date range that is guaranteed to include the test data
        data = {'start_date': '2025-06-01', 'end_date': '2025-06-30'}
        response = self.client.get(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_quantity'], 3)

    def test_stats_by_category(self):
        url = reverse('purchased-stats-by-category')
        # Fix: Create a date range that is guaranteed to include the test data
        data = {'start_date': '2025-06-01', 'end_date': '2025-06-30'}
        response = self.client.get(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['name'], 'Dairy')

from rest_framework import serializers
from ..models.add_to_list import AddToList
from ..models.shopping_list import ShoppingList
from api.serializers.product_catalog_serializer import ProductCatalogSerializer
from api.serializers.shopping_serializers import ShoppingListSerializer
from api.models.product_catalog import ProductCatalog


class AddToListSerializer(serializers.ModelSerializer):
    """Serializer for items added to a shopping list."""
    product_details = ProductCatalogSerializer(source='product', read_only=True)
    
    class Meta:
        model = AddToList
        fields = ['id', 'list', 'product', 'quantity', 'status', 'product_details']
        extra_kwargs = {
            'product': {'write_only': True}
        }

class ShoppingListSerializer(serializers.ModelSerializer):
    """Serializer for the ShoppingList model."""
    class Meta:
        model = ShoppingList
        fields = ['listID', 'createdAt', 'listName', 'date', 'group', 'user', 'type']
        read_only_fields = ['listID', 'createdAt', 'user']