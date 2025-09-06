from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from .models import Registration

User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating User objects.
    Handles password hashing.
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name',
            'last_name', 'service_number', 'rank', 'is_active',
            'is_staff', 'date_joined'
        ]
        read_only_fields = ['id', 'is_active', 'is_staff', 'date_joined']
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': True,
                'style': {'input_type': 'password'}
            }
        }

    def create(self, validated_data):
        """
        Create and return a new user with an encrypted password.
        """
        validated_data['password'] = make_password(validated_data.get('password'))
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing user, handling password changes.
        """
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)


class UserSerializer(serializers.ModelSerializer):
    """
    Simplified User serializer for listing users or read-only usage.
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'service_number', 'rank'
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for detailed user profile view.
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'service_number', 'rank', 'is_active', 'date_joined'
        ]
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login, validates credentials.
    Works with JWT TokenObtainPairView.
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True, write_only=True, style={'input_type': 'password'}
    )

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return {"user": user}
        raise serializers.ValidationError(
            "Invalid username or password. Please try again."
        )


class RegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for creating registration requests.
    Stores the raw password temporarily for approval.
    """
    password = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'}
    )

    class Meta:
        model = Registration
        fields = [
            'id', 'username', 'email', 'password', 'first_name',
            'last_name', 'service_number', 'rank'
        ]

    def create(self, validated_data):
        """
        Create a new registration request, storing the raw password.
        """
        validated_data['password_raw'] = validated_data.pop('password')
        return Registration.objects.create(**validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for the password change endpoint.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                "Old password is incorrect. Please try again."
            )
        return value

    def validate(self, data):
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError(
                "New password cannot be the same as the old password."
            )
        return data


class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a user's own profile information.
    Only allows specific fields to be updated.
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
