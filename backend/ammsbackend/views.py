from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from .models import Register
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
import logging

class RegisterViewSet(viewsets.ModelViewSet):
    queryset = Register.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # Allows unrestricted access to registration
    
    # Optional: Customize create behavior if needed
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # Customize response data if needed
        return response
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = LoginSerializer

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            logger.exception("Login failed")
            return Response(
                {"error": "Internal server error"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response(
                {"error": "Login service unavailable"}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
class SafeTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            logger.exception("Login failed")
            return Response(
                {"error": "Internal server error"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )