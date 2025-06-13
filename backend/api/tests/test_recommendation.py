from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from ..models.group import Group
from ..models.fridge import Fridge
from ..models.add_to_fridge import AddToFridge
from ..models.recipe import Recipe
from ..models.ingredient import Ingredient
from ..models.product import Product

class RecipeRecommendationViewTests(APITestCase):
    
    def setUp(self):
        # Tạo người dùng
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client.login(username='testuser', password='testpass')

        # Tạo nhóm và tủ lạnh
        self.group = Group.objects.create(name='Test Group')
        self.group.members.add(self.user)
        self.fridge = Fridge.objects.create(group=self.group)

        # Tạo sản phẩm
        self.product1 = Product.objects.create(productID=1, productName='Egg')
        self.product2 = Product.objects.create(productID=2, productName='Milk')
        self.product3 = Product.objects.create(productID=3, productName='Flour')

        # Thêm sản phẩm vào tủ lạnh
        AddToFridge.objects.create(fridge=self.fridge, product=self.product1)
        AddToFridge.objects.create(fridge=self.fridge, product=self.product2)

        # Tạo công thức
        self.recipe = Recipe.objects.create(name='Pancake')
        Ingredient.objects.create(recipe=self.recipe, product=self.product1)
        Ingredient.objects.create(recipe=self.recipe, product=self.product2)
        Ingredient.objects.create(recipe=self.recipe, product=self.product3)

    def test_no_group(self):
        # Người dùng không thuộc nhóm nào
        self.group.members.remove(self.user)

        response = self.client.get('recommendation/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, "User không thuộc nhóm nào")

    def test_recommendations_with_full_match(self):
        # Thêm tất cả sản phẩm vào tủ lạnh để có match 100%
        AddToFridge.objects.create(fridge=self.fridge, product=self.product3)

        response = self.client.get('recommendation/', {'group_id': self.group.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_recommendations'], 1)
        self.assertEqual(response.data['recommendations'][0]['match_percentage'], 100.0)

    def test_recommendations_with_partial_match(self):
        # Test trường hợp chỉ có match một phần
        response = self.client.get('recommendation/', {'group_id': self.group.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_recommendations'], 1)
        self.assertEqual(response.data['recommendations'][0]['match_percentage'], 66.67)  # 2/3
        self.assertEqual(len(response.data['recommendations'][0]['missing_ingredients']), 1)
        self.assertEqual(response.data['recommendations'][0]['missing_ingredients'][0]['product_name'], 'Flour')

    def test_pagination(self):
        # Tạo thêm nhiều công thức để kiểm tra phân trang
        for i in range(2, 10):
            recipe = Recipe.objects.create(name=f'Recipe {i}')
            Ingredient.objects.create(recipe=recipe, product=self.product1)

        response = self.client.get('recommendation/', {
            'group_id': self.group.id,
            'page': 1,
            'page_size': 3
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['page'], 1)
        self.assertEqual(response.data['page_size'], 3)
        self.assertEqual(len(response.data['recommendations']), 3)

    def test_missing_ingredients_detail(self):
        # Kiểm tra chi tiết các nguyên liệu thiếu
        response = self.client.get('recommendation/', {'group_id': self.group.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        missing_ingredients = response.data['recommendations'][0]['missing_ingredients']
        self.assertEqual(len(missing_ingredients), 1)
        self.assertEqual(missing_ingredients[0]['product_id'], self.product3.productID)
        self.assertEqual(missing_ingredients[0]['product_name'], self.product3.productName)
