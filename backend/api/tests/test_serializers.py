import pytest
from django.test import TestCase
from rest_framework import serializers
from api.models.user import User
from api.serializers.user import RegisterSerializer, LoginSerializer, CustomTokenObtainPairSerializer, validate_email
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.django_db
class TestRegisterSerializer(TestCase):
    def test_validate_email_already_exists(self):
        # Create a user with an existing email
        User.objects.create_user(email='test@example.com', username='test@example.com', password='password123')
        
        # Test email validation
        with pytest.raises(serializers.ValidationError) as exc_info:
            validate_email('test@example.com')
        assert str(exc_info.value) == "['Email này đã được sử dụng']"

    def test_validate_email_unique(self):
        # Test with a unique email
        result = validate_email('new@example.com')
        assert result == 'new@example.com'

    def test_create_user(self):
        # Test user creation
        serializer = RegisterSerializer(data={
            'email': 'newuser@example.com',
            'name': 'Test User',
            'password': 'password123'
        })
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        
        # Verify user was created
        assert user.email == 'newuser@example.com'
        assert user.username == 'newuser@example.com'
        assert user.name == 'Test User'
        assert user.check_password('password123')  # Verify password is hashed
        assert User.objects.filter(email='newuser@example.com').exists()

    def test_create_user_missing_fields(self):
        # Test with missing required fields
        serializer = RegisterSerializer(data={'email': 'test@example.com'})
        assert not serializer.is_valid()
        assert 'password' in serializer.errors
        assert 'name' in serializer.errors

@pytest.mark.django_db
class TestLoginSerializer(TestCase):
    def test_login_serializer_fields(self):
        # Test serializer fields
        serializer = LoginSerializer()
        expected_fields = {'email', 'password'}
        assert set(serializer.fields.keys()) == expected_fields

    def test_login_serializer_validation(self):
        # Test valid data
        serializer = LoginSerializer(data={
            'email': 'test@example.com',
            'password': 'password123'
        })
        assert serializer.is_valid(), serializer.errors

    def test_login_serializer_invalid_data(self):
        # Test invalid data (missing fields)
        serializer = LoginSerializer(data={'email': 'test@example.com'})
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

@pytest.mark.django_db
class TestCustomTokenObtainPairSerializer(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            email='test@example.com',
            username='test@example.com',
            password='password123'
        )

    def test_validate_success(self):
        # Test successful validation and token generation
        serializer = CustomTokenObtainPairSerializer(data={
            'email': 'test@example.com',
            'password': 'password123'
        })
        assert serializer.is_valid(), serializer.errors
        data = serializer.validated_data
        
        # Verify tokens are generated
        assert 'refresh' in data
        assert 'access' in data
        
        # Verify token contents
        refresh = RefreshToken(data['refresh'])
        assert refresh['user_id'] == self.user.id

    def test_validate_invalid_email(self):
        # Test with non-existent email
        serializer = CustomTokenObtainPairSerializer(data={
            'email': 'nonexistent@example.com',
            'password': 'password123'
        })
        with pytest.raises(serializers.ValidationError) as exc_info:
            serializer.is_valid(raise_exception=True)
        assert 'email' in exc_info.value.detail
        assert exc_info.value.detail['email'] == 'Email không tồn tại.'

    def test_validate_invalid_password(self):
        # Test with incorrect password
        serializer = CustomTokenObtainPairSerializer(data={
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        with pytest.raises(serializers.ValidationError) as exc_info:
            serializer.is_valid(raise_exception=True)
        assert 'password' in exc_info.value.detail
        assert exc_info.value.detail['password'] == 'Mật khẩu không đúng.'

    def test_username_field_is_email(self):
        # Verify that username_field is set to email
        serializer = CustomTokenObtainPairSerializer()
        assert serializer.username_field == 'email'