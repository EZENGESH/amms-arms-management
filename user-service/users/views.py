from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

# Import models and serializers
from .models import Registration
from .serializers import (
    CustomUserSerializer, UserSerializer, UserProfileSerializer,
    LoginSerializer, RegistrationSerializer, ChangePasswordSerializer,
    UpdateProfileSerializer
)

User = get_user_model()


class ApiRoot(APIView):
    """Root endpoint for the User Service API."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "User Service API", "version": "1.0.0"})


# --- Authentication Views ---

class LoginView(TokenObtainPairView):
    """
    Login endpoint returning access & refresh tokens plus user details.
    """
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data["username"])
            response.data["user"] = UserSerializer(user).data
        return response


class LogoutView(APIView):
    """Blacklists the refresh token (requires JWT blacklist enabled)."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required"},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"},
                            status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(generics.GenericAPIView):
    """Allows users to change their password."""
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)



# --- User Management Views ---

class RegisterView(generics.CreateAPIView):
    """Register a new user."""
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]


class UserListView(generics.ListAPIView):
    """List all active users (Admin only)."""
    queryset = User.objects.filter(is_active=True).order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class UserProfileView(generics.RetrieveAPIView):
    """Retrieve profile of the logged-in user."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UpdateProfileView(generics.UpdateAPIView):
    """Update profile of the logged-in user."""
    serializer_class = UpdateProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserUpdateView(generics.UpdateAPIView):
    """Admin: Update any user by ID."""
    queryset = User.objects.all()
    serializer_class = UpdateProfileSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "message": f"User {instance.username} updated successfully",
            "user": serializer.data
        }, status=status.HTTP_200_OK)


class UserRetrieveDeleteView(generics.RetrieveDestroyAPIView):
    """Admin: Retrieve or delete a user by ID."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


# --- Registration Flow ---

class RegistrationAPIView(generics.CreateAPIView):
    """Submit a registration request."""
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [AllowAny]


class RegistrationListView(generics.ListAPIView):
    """List all registrations (Admin only)."""
    queryset = Registration.objects.all().order_by('-created_at')
    serializer_class = RegistrationSerializer
    permission_classes = [IsAdminUser]


class RegistrationApproveView(APIView):
    """Admin: Approve a registration and create a user."""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        registration = get_object_or_404(Registration, pk=pk)
        if registration.is_approved:
            return Response({'error': 'Already approved'}, status=status.HTTP_400_BAD_REQUEST)

        user_serializer = CustomUserSerializer(data={
            'username': registration.username,
            'email': registration.email,
            'first_name': registration.first_name,
            'last_name': registration.last_name,
            'service_number': registration.service_number,
            'rank': registration.rank,
            'password': registration.password_raw
        })

        if user_serializer.is_valid():
            user = user_serializer.save()
            registration.is_approved = True
            registration.save()
            return Response({
                'message': f'Registration approved for {registration.username}',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistrationRejectView(APIView):
    """Admin: Reject and delete a registration request."""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        registration = get_object_or_404(Registration, pk=pk)
        if registration.is_approved:
            return Response({'error': 'Already approved'}, status=status.HTTP_400_BAD_REQUEST)
        registration.delete()
        return Response({'message': 'Registration rejected and deleted'}, status=status.HTTP_204_NO_CONTENT)
