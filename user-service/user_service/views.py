from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model, login, logout, authenticate
from django.contrib.auth.hashers import make_password
from rest_framework import status, viewsets, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import Registration
from .serializers import (
    CustomUserSerializer, UserSerializer, UserProfileSerializer,
    LoginSerializer, RegistrationSerializer
)

User = get_user_model()


class ApiRoot(APIView):
    """
    Root API view that lists all available endpoints
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            "message": "User Service API",
            "version": "1.0.0",
            "endpoints": {
                "authentication": {
                    "login": "POST /api/auth/login/",
                    "logout": "POST /api/auth/logout/",
                    "change_password": "POST /api/auth/change-password/"
                },
                "users": {
                    "register": "POST /api/users/register/",
                    "list_users": "GET /api/users/ (authenticated)",
                    "get_profile": "GET /api/users/profile/ (authenticated)",
                    "update_profile": "PATCH /api/users/update_profile/ (authenticated)"
                },
                "registrations": {
                    "create": "POST /api/registrations/",
                    "list": "GET /api/registrations/ (admin only)",
                    "approve": "POST /api/registrations/{id}/approve/ (admin only)",
                    "reject": "POST /api/registrations/{id}/reject/ (admin only)"
                },
                "admin": {
                    "admin_panel": "GET /admin/"
                }
            },
            "sample_requests": {
                "register": {
                    "url": "/api/users/register/",
                    "method": "POST",
                    "data": {
                        "username": "testuser",
                        "email": "test@example.com",
                        "first_name": "Test",
                        "last_name": "User",
                        "service_number": "SN001",
                        "rank": "Lieutenant",
                        "password": "testpassword123"
                    }
                },
                "login": {
                    "url": "/api/auth/login/",
                    "method": "POST",
                    "data": {
                        "username": "testuser",
                        "password": "testpassword123"
                    }
                }
            }
        })


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    """
    permission_classes = [AllowAny]
    serializer_class = CustomUserSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': CustomUserSerializer(user, context=self.get_serializer_context()).data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    # This is the important part - allow anyone to access the login endpoint
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'username': user.username
            })
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
        
class LogoutView(APIView):
    """
    API endpoint for user logout
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        request.auth.delete()  # Delete the authentication token
        logout(request)
        return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    API endpoint for changing user password
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(old_password):
            return Response({'error': 'Incorrect old password'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    """
    API endpoint for listing users (authenticated users only)
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class UserProfileView(generics.RetrieveAPIView):
    """
    API endpoint for retrieving the current user's profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UpdateProfileView(generics.UpdateAPIView):
    """
    API endpoint for updating the current user's profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class RegistrationAPIView(generics.CreateAPIView):
    """
    API endpoint for creating a registration request
    """
    permission_classes = [AllowAny]
    serializer_class = RegistrationSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Hash the password before saving
            password = serializer.validated_data['password']
            serializer.validated_data['password'] = make_password(password)
            serializer.save()
            return Response({
                'message': 'Registration request created successfully. It will be reviewed by an administrator.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistrationListView(generics.ListAPIView):
    """
    API endpoint for listing all registration requests (admin only)
    """
    queryset = Registration.objects.all().order_by('-created_at')
    serializer_class = RegistrationSerializer
    permission_classes = [IsAdminUser]


class RegistrationApproveView(APIView):
    """
    API endpoint for approving a registration request (admin only)
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        registration = get_object_or_404(Registration, pk=pk)
        
        if registration.is_approved:
            return Response({'error': 'This registration is already approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a new user from the registration data
        user_data = {
            'username': registration.username,
            'email': registration.email,
            'first_name': registration.first_name,
            'last_name': registration.last_name,
            'service_number': registration.service_number,
            'rank': registration.rank,
            'password': registration.password  # Password is already hashed
        }
        
        user_serializer = CustomUserSerializer(data=user_data)
        if user_serializer.is_valid():
            user = User.objects.create(
                username=registration.username,
                email=registration.email,
                first_name=registration.first_name,
                last_name=registration.last_name,
                service_number=registration.service_number,
                rank=registration.rank,
                # No need to hash the password since it's already hashed
                password=registration.password
            )
            
            # Mark registration as approved
            registration.is_approved = True
            registration.save()
            
            return Response({
                'message': f'Registration for {registration.username} approved and user created',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistrationRejectView(APIView):
    """
    API endpoint for rejecting a registration request (admin only)
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        registration = get_object_or_404(Registration, pk=pk)
        
        if registration.is_approved:
            return Response({'error': 'This registration is already approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete the registration
        registration.delete()
        
        return Response({
            'message': f'Registration for {registration.username} rejected and deleted'
        }, status=status.HTTP_200_OK)