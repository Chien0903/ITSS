# import pytest
# from rest_framework import status
# from django.urls import reverse
# from django.contrib.auth import get_user_model
# # from ..models.cart import Cart, CartItem
# from ..models.product_catalog import ProductCatalog

# User = get_user_model()

# @pytest.mark.django_db
# def test_get_cart(api_client):
#     user = User.objects.create_user(username="testuser", password="testpassword")
#     api_client.force_authenticate(user=user)

#     # Kiểm tra khi giỏ hàng chưa tồn tại
#     response = api_client.get(reverse('cart:cart'))
#     assert response.status_code == status.HTTP_200_OK
#     assert response.data['user'] == user.id

#     # Tạo giỏ hàng và kiểm tra lại
#     cart = Cart.objects.create(user=user, is_checked_out=False)
#     response = api_client.get(reverse('cart:cart'))
#     assert response.status_code == status.HTTP_200_OK
#     assert response.data['id'] == cart.id


# @pytest.mark.django_db
# def test_add_to_cart(api_client):
#     user = User.objects.create_user(username="testuser", password="testpassword")
#     product = ProductCatalog.objects.create(name="Test Product", price=100.0)
#     api_client.force_authenticate(user=user)

#     url = reverse('cart:cart-add')
#     data = {'product_id': product.id, 'quantity': 2}
#     response = api_client.post(url, data, format='json')
#     assert response.status_code == status.HTTP_201_CREATED
#     assert response.data['message'] == 'Đã thêm sản phẩm vào giỏ hàng'

#     # Kiểm tra dữ liệu trong cơ sở dữ liệu
#     cart = Cart.objects.get(user=user, is_checked_out=False)
#     cart_item = CartItem.objects.get(cart=cart, product=product)
#     assert cart_item.quantity == 2


# @pytest.mark.django_db
# def test_remove_from_cart(api_client):
#     user = User.objects.create_user(username="testuser", password="testpassword")
#     product = ProductCatalog.objects.create(name="Test Product", price=100.0)
#     cart = Cart.objects.create(user=user, is_checked_out=False)
#     CartItem.objects.create(cart=cart, product=product, quantity=2)
#     api_client.force_authenticate(user=user)

#     url = reverse('cart:cart-remove')
#     data = {'product_id': product.id}
#     response = api_client.delete(url, data, format='json')
#     assert response.status_code == status.HTTP_200_OK
#     assert response.data['message'] == 'Đã xoá sản phẩm khỏi giỏ hàng'

#     # Kiểm tra dữ liệu trong cơ sở dữ liệu
#     assert not CartItem.objects.filter(cart=cart, product=product).exists()
