from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from ..serializers.user import UserSerializer
from ..models.user import User

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Đăng ký thành công',
                'user': {
                    'id': user.userID,
                    'email': user.email,
                    'name': user.name,
                    'role': user.role
                }
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Đăng ký thất bại',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({
                'message': 'Vui lòng nhập email và mật khẩu'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if user.password == password:  # Trong thực tế nên so sánh password đã mã hóa
                return Response({
                    'message': 'Đăng nhập thành công',
                    'user': {
                        'id': user.userID,
                        'email': user.email,
                        'name': user.name,
                        'role': user.role
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Mật khẩu không đúng'
                }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({
                'message': 'Email không tồn tại'
            }, status=status.HTTP_400_BAD_REQUEST) 