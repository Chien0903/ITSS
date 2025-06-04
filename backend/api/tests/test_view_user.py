from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAPITestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email='testuser@example.com',
            password='password123',
            name='Test User',
            role='user'
        )
        cls.register_url = '/api/register/'
        cls.login_url = '/api/token/'
        cls.user_list_url = '/api/users/'

    def test_register_success(self):
        data = {
            'email': 'newuser@example.com',
            'password': 'password123',
            'name': 'New User',
            'role': 'user'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Đăng ký thành công')
        self.assertIn('user', response.data)

    def test_register_failure(self):
        data = {
            'email': '',
            'password': 'password123',
            'name': 'New User',
            'role': 'user'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], 'Đăng ký thất bại')

    def test_login_success(self):
        data = {
            'email': self.user.email,
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_login_failure(self):
        data = {
            'email': self.user.email,
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_list_authenticated(self):
        login_response = self.client.post(self.login_url, {
            'email': self.user.email,
            'password': 'password123'
        })
        access_token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.user_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_user_list_unauthenticated(self):
        response = self.client.get(self.user_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
