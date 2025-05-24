from django.urls import path
from ..views.product_catalog_view import ProductCatalogView, ProductCatalogDetailView
from ..views.categories_view import CategoriesView, CategoriesDetailView
from ..views.user import RegisterView, CustomTokenObtainPairView, UserListView
from ..views.group import GroupListView, CreateGroupView, JoinGroupView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    # path('login/', LoginView.as_view(), name='login'),
    path('products/', ProductCatalogView.as_view(), name='products'),
    path('products/<int:pk>/', ProductCatalogDetailView.as_view(), name='product-detail'),
    path('categories/', CategoriesView.as_view(), name='categories'),
    path('categories/<int:pk>/', CategoriesDetailView.as_view(), name='category-detail'),
    
    # Group URLs
    path('groups/', GroupListView.as_view(), name='group-list'),
    path('groups/create/', CreateGroupView.as_view(), name='group-create'),
    path('groups/<int:group_id>/join/', JoinGroupView.as_view(), name='group-join'),
    path('users/', UserListView.as_view(), name='user-list'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)