from rest_framework import serializers
from ..models.user import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['userID', 'email', 'name', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'userID': {'read_only': True},
            'role': {'read_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],  # Trong thực tế nên mã hóa password
            role='user'  # Mặc định role là user khi đăng ký
        )
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email này đã được sử dụng")
        return value 
