from django.urls import path
from ..views.fridge import FridgeDetailView, FridgeNotificationView

urlpatterns = [
    path('', FridgeDetailView.as_view(), name='fridge-list'),
    path('notifications/', FridgeNotificationView.as_view(), name='fridge-notifications'),
    path('<int:id>/', FridgeDetailView.as_view(), name='fridge-item'),
]