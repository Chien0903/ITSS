from django.urls import path, include
from ..views.product_catalog_view import ProductCatalogView, ProductCatalogDetailView, ProductPriceView
from ..views.categories_view import CategoriesView, CategoriesDetailView
from ..views.user import RegisterView, CustomTokenObtainPairView, UserListView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('products/', ProductCatalogView.as_view(), name='products'),
    path('products/<int:pk>/', ProductCatalogDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/price/', ProductPriceView.as_view(), name='product-price'),
    path('categories/', CategoriesView.as_view(), name='categories'),
    path('categories/<int:pk>/', CategoriesDetailView.as_view(), name='category-detail'),
    # Group URLs
    path('groups/', include('api.urls.group')),
    path('users/', UserListView.as_view(), name='user-list'),
    #Cart
    path('cart/', include('api.urls.cart')),
    # Shopping List URLs
    path('shopping-lists/', include('api.urls.shopping_list_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)