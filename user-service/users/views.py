from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

# Correctly import models and serializers from the 'users' app
from .models import Registration
from .serializers import (
    CustomUserSerializer, UserSerializer, UserProfileSerializer,
    LoginSerializer, RegistrationSerializer, ChangePasswordSerializer,
    UpdateProfileSerializer
)

User = get_user_model()


class ApiRoot(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({"message": "User Service API", "version": "1.0.0"})


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = CustomUserSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    queryset = User.objects.filter(is_active=True).order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user


class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = UpdateProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user


class RegistrationAPIView(generics.CreateAPIView):
    queryset = Registration.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegistrationSerializer


class RegistrationListView(generics.ListAPIView):
    queryset = Registration.objects.all().order_by('-created_at')
    serializer_class = RegistrationSerializer
    permission_classes = [IsAdminUser]


class RegistrationApproveView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        registration = get_object_or_404(Registration, pk=pk)
        if registration.is_approved:
            return Response({'error': 'This registration is already approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data = {
            'username': registration.username,
            'email': registration.email,
            'first_name': registration.first_name,
            'last_name': registration.last_name,
            'service_number': registration.service_number,
            'rank': registration.rank,
            'password': registration.password_raw 
        }
        
        user_serializer = CustomUserSerializer(data=user_data)
        if user_serializer.is_valid():
            user = user_serializer.save()
            registration.is_approved = True
            registration.save()
            return Response({
                'message': f'Registration for {registration.username} approved and user created',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistrationRejectView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        registration = get_object_or_404(Registration, pk=pk)
        if registration.is_approved:
            return Response({'error': 'This registration is already approved'}, status=status.HTTP_400_BAD_REQUEST)
        registration.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)