from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from api.models.shopping_list import ShoppingList
from api.models.add_to_list import AddToList
from api.models import ProductCatalog, Categories
from api.models import Group  # Import model Group nếu chưa có

User = get_user_model()

class ShoppingListTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user1', password='password')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.group = Group.objects.create(groupName='Test Group')
        self.shopping_list = ShoppingList.objects.create(user=self.user, group=self.group, title='List B')

    def test_create_shopping_list(self):
        url = reverse('shopping-list')
        data = {'group': self.group.groupID, 'title': 'Test List'}  # Sử dụng groupID
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['title'], 'Test List')

    def test_get_shopping_lists(self):
        ShoppingList.objects.create(user=self.user, group=self.group, title='List A')  # Sử dụng instance
        url = reverse('shopping-list')
        response = self.client.get(url, {'group_id': self.group.groupID})  # Sử dụng groupID
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
class ShoppingListDetailTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user2', password='pass')
        self.client.force_authenticate(self.user)
        self.shopping_list = ShoppingList.objects.create(user=self.user, group=1, title='List B')

    def test_get_list_detail(self):
        url = reverse('shopping-list-detail', args=[self.shopping_list.listID])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['list']['title'], 'List B')

    def test_update_shopping_list(self):
        url = reverse('shopping-list-detail', args=[self.shopping_list.listID])
        response = self.client.put(url, {'title': 'Updated Title'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['title'], 'Updated Title')

    def test_delete_shopping_list(self):
        url = reverse('shopping-list-detail', args=[self.shopping_list.listID])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)

class AddItemTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user3', password='pass')
        self.client.force_authenticate(self.user)
        self.list = ShoppingList.objects.create(user=self.user, group=2, title='List C')
        self.product = ProductCatalog.objects.create(name='Milk', price=10)

    def test_add_item_to_list(self):
        url = reverse('add-to-list', args=[self.list.listID])
        response = self.client.post(url, {
            'product': self.product.id,
            'quantity': 2
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['data']['quantity'], 2)

class UpdateItemTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user4', password='pass')
        self.client.force_authenticate(self.user)
        self.list = ShoppingList.objects.create(user=self.user, group=1, title='List D')
        self.product = ProductCatalog.objects.create(name='Egg', price=5)
        self.item = AddToList.objects.create(list=self.list, product=self.product, quantity=3)

    def test_update_item_quantity(self):
        url = reverse('add-to-list-detail', args=[self.list.listID, self.item.id])
        response = self.client.put(url, {'quantity': 5})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['quantity'], 5)

    def test_delete_item(self):
        url = reverse('add-to-list-detail', args=[self.list.listID, self.item.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)

class ToggleStatusTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user5', password='pass')
        self.client.force_authenticate(self.user)
        self.list = ShoppingList.objects.create(user=self.user, group=1, title='List E')
        self.product = ProductCatalog.objects.create(name='Rice', price=8)
        self.item = AddToList.objects.create(list=self.list, product=self.product, quantity=1, status='pending')

    def test_toggle_status(self):
        url = reverse('toggle-item-status', args=[self.list.listID, self.item.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['status'], 'purchased')

class StatsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user6', password='pass')
        self.client.force_authenticate(self.user)
        self.category = Categories.objects.create(categoryName='Dairy')
        self.product = ProductCatalog.objects.create(name='Cheese', price=15, category=self.category)
        self.list = ShoppingList.objects.create(user=self.user, group=1, title='Stats List')
        AddToList.objects.create(list=self.list, product=self.product, quantity=3, status='purchased')

    def test_purchased_stats(self):
        url = reverse('purchased-shopping-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_quantity'], 3)

    def test_stats_by_category(self):
        url = reverse('purchased-stats-by-category')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['name'], 'Dairy')
