from django.urls import path
from ..views.fridge import FridgeDetailView

urlpatterns = [
    path('', FridgeDetailView.as_view(), name='fridge-list'),
    path('<int:id>/', FridgeDetailView.as_view(), name='fridge-item'),
]