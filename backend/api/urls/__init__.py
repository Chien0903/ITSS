from django.urls import path, include
from ..views.product_catalog_view import ProductCatalogView, ProductCatalogDetailView, ProductPriceView, ProductCatalogSearchView
from ..views.categories_view import CategoriesView, CategoriesDetailView
from ..views.user import RegisterView, CustomTokenObtainPairView, UserListView, UserMeView, UserUpdateView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import routers
from ..views.recipe import IngredientView, RecipeView


router = routers.DefaultRouter()
router.register(r'recipes', RecipeView)
router.register(r'ingredients', IngredientView)


urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('products/', ProductCatalogView.as_view(), name='products'),
    path('products/<int:pk>/', ProductCatalogDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/price/', ProductPriceView.as_view(), name='product-price'),
    path("products/search/", ProductCatalogSearchView.as_view(), name="product-search"), #Thêm vào để tìm kiếm
    path('categories/', CategoriesView.as_view(), name='categories'),
    # Group URLs
    path('groups/', include('api.urls.group')),
    path('users/', UserListView.as_view(), name='user-list'),
    # User profile APIs
    path('user/me/', UserMeView.as_view(), name='user-me'),
    path('user/update/', UserUpdateView.as_view(), name='user-update'),
    # Shopping List URLs
    path('shopping-lists/', include('api.urls.shopping_list_urls')),
    #Fridge
    path('fridge/', include('api.urls.fridge')),
    # Meal Plan URLs
    path('meal-plans/', include('api.urls.meal_plan')),
    #Recipe + Ingredients
    path('', include(router.urls))
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)