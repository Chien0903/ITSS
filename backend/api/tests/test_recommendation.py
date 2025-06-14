import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from django.urls import path

# ===> BƯỚC 3: THÊM CÁC DÒNG IMPORT NÀY <===
from api.models import (
    ProductCatalog as Product,
    Group, 
    Fridge, 
    AddToFridge, 
    Recipe, 
    Ingredient
)
from api.serializers.recipe_serializers import RecipeSerializer



# ===> Cấu hình URL và các Fixture giữ nguyên <===
from api.views.recommendation import RecipeRecommendationView

urlpatterns = [
    path('api/recommendations/', RecipeRecommendationView.as_view(), name='recipe-recommendations'),
]

pytestmark = [
    pytest.mark.urls(__name__),
    pytest.mark.django_db
]

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def setup_data():
    """
    Tạo một bộ dữ liệu hoàn chỉnh để test:
    - 2 người dùng: user_a, user_b
    - 1 nhóm: group_a (user_a là thành viên)
    - 5 sản phẩm: Thịt bò, Cà rốt, Hành tây, Gà, Muối
    - 3 công thức:
        1. Bò hầm (Thịt bò, Cà rốt, Hành tây)
        2. Canh gà (Gà, Cà rốt, Muối)
        3. Salad đơn giản (Cà rốt, Hành tây)
    - Tủ lạnh của nhóm có: Thịt bò, Cà rốt
    """
    user_a = User.objects.create_user(username='user_a', password='password')
    user_b = User.objects.create_user(username='user_b', password='password') # User không thuộc nhóm

    group_a = Group.objects.create(name='Nhóm A')
    group_a.members.add(user_a)

    fridge_a, _ = Fridge.objects.get_or_create(group=group_a)

    # Sản phẩm
    p_beef = Product.objects.create(productName='Thịt bò')
    p_carrot = Product.objects.create(productName='Cà rốt')
    p_onion = Product.objects.create(productName='Hành tây')
    p_chicken = Product.objects.create(productName='Gà')
    p_salt = Product.objects.create(productName='Muối')
    
    # Thêm vào tủ lạnh của nhóm A
    AddToFridge.objects.create(fridge=fridge_a, product=p_beef)
    AddToFridge.objects.create(fridge=fridge_a, product=p_carrot)

    # Công thức
    # Bò hầm: 3 nguyên liệu. Tủ lạnh có 2/3 -> 66.67%
    recipe_beef_stew = Recipe.objects.create(name='Bò hầm')
    Ingredient.objects.create(recipe=recipe_beef_stew, product=p_beef)
    Ingredient.objects.create(recipe=recipe_beef_stew, product=p_carrot)
    Ingredient.objects.create(recipe=recipe_beef_stew, product=p_onion)

    # Canh gà: 3 nguyên liệu. Tủ lạnh có 1/3 -> 33.33%
    recipe_chicken_soup = Recipe.objects.create(name='Canh gà')
    Ingredient.objects.create(recipe=recipe_chicken_soup, product=p_chicken)
    Ingredient.objects.create(recipe=recipe_chicken_soup, product=p_carrot)
    Ingredient.objects.create(recipe=recipe_chicken_soup, product=p_salt)

    # Salad: 2 nguyên liệu. Tủ lạnh có 2/2 -> 100%
    recipe_salad = Recipe.objects.create(name='Salad đơn giản')
    Ingredient.objects.create(recipe=recipe_salad, product=p_carrot)
    Ingredient.objects.create(recipe=recipe_salad, product=p_onion)
    
    return {
        'user_a': user_a,
        'user_b': user_b,
        'group_a': group_a,
        'p_onion': p_onion
    }


# ===================================================================
# 5. CÁC HÀM TEST
# ===================================================================

class TestRecipeRecommendationView:

    def test_unauthenticated_user_cannot_access(self, api_client):
        """Kiểm tra người dùng chưa đăng nhập bị từ chối."""
        response = api_client.get('/api/recommendations/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_in_no_group_receives_error(self, api_client):
        """Kiểm tra người dùng không thuộc nhóm nào nhận được lỗi."""
        user = User.objects.create_user(username='lonely_user', password='password')
        api_client.force_authenticate(user=user)
        
        response = api_client.get('/api/recommendations/')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data == "User không thuộc nhóm nào"

    def test_recommendation_logic_sorting_and_data_structure(self, api_client, setup_data):
        """
        Kiểm tra toàn bộ logic chính:
        - Tính toán đúng
        - Sắp xếp đúng
        - Cấu trúc dữ liệu trả về đúng
        """
        user_a = setup_data['user_a']
        api_client.force_authenticate(user=user_a)

        response = api_client.get('/api/recommendations/')
        assert response.status_code == status.HTTP_200_OK

        # Kiểm tra metadata
        assert response.data['total_recommendations'] == 3
        assert response.data['page'] == 1
        
        recommendations = response.data['recommendations']
        assert len(recommendations) == 3

        # Do đã sắp xếp, item đầu tiên phải là Salad (100%)
        salad = recommendations[0]
        assert salad['name'] == 'Salad đơn giản'
        assert salad['match_percentage'] == 100.00
        assert salad['matching_ingredients_count'] == 2
        assert salad['total_ingredients'] == 2
        assert len(salad['missing_ingredients']) == 0

        # Item thứ hai là Bò hầm (66.67%)
        beef_stew = recommendations[1]
        assert beef_stew['name'] == 'Bò hầm'
        assert beef_stew['match_percentage'] == 66.67
        assert beef_stew['matching_ingredients_count'] == 2
        assert beef_stew['total_ingredients'] == 3
        assert len(beef_stew['missing_ingredients']) == 1
        assert beef_stew['missing_ingredients'][0]['product_name'] == 'Hành tây'

        # Item thứ ba là Canh gà (33.33%)
        chicken_soup = recommendations[2]
        assert chicken_soup['name'] == 'Canh gà'
        assert chicken_soup['match_percentage'] == 33.33
        assert chicken_soup['matching_ingredients_count'] == 1
        assert chicken_soup['total_ingredients'] == 3
        assert len(chicken_soup['missing_ingredients']) == 2
        # Lấy tên các nguyên liệu thiếu để kiểm tra
        missing_names = {item['product_name'] for item in chicken_soup['missing_ingredients']}
        assert missing_names == {'Gà', 'Muối'}
        
    def test_pagination(self, api_client, setup_data):
        """Kiểm tra logic phân trang."""
        user_a = setup_data['user_a']
        api_client.force_authenticate(user=user_a)

        # Yêu cầu trang 2, mỗi trang 1 item
        response = api_client.get('/api/recommendations/?page=2&page_size=1')
        assert response.status_code == status.HTTP_200_OK

        # Kiểm tra metadata phân trang
        assert response.data['total_recommendations'] == 3
        assert response.data['page'] == 2
        assert response.data['page_size'] == 1
        assert response.data['total_pages'] == 3

        # Dữ liệu trả về chỉ có 1 item
        recommendations = response.data['recommendations']
        assert len(recommendations) == 1

        # Item đó phải là item thứ 2 trong danh sách đã sắp xếp (Bò hầm)
        assert recommendations[0]['name'] == 'Bò hầm'
        assert recommendations[0]['match_percentage'] == 66.67