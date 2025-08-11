from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import Registration

User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    Handles serialization and deserialization of User objects
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 
            'last_name', 'service_number', 'rank', 'is_active', 
            'is_staff', 'date_joined'
        ]
        read_only_fields = ['id', 'is_active', 'is_staff', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        """
        Create and return a new user with encrypted password
        """
        validated_data['password'] = make_password(validated_data.get('password'))
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """
        Update and return an existing user
        """
        password = validated_data.pop('password', None)
        if password:
            instance.password = make_password(password)
        
        return super().update(instance, validated_data)


class UserSerializer(serializers.ModelSerializer):
    """
    Simplified User serializer for listing users
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'service_number', 'rank']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'service_number', 'rank', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'username', 'email', 'is_active', 'date_joined']


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)


class RegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for registration requests
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = Registration
        fields = [
            'id', 'username', 'email', 'password', 'first_name',
            'last_name', 'service_number', 'rank', 'is_approved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_approved', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """
        Create and return a new registration request
        """
        # We don't hash the password here as we'll do it when creating the actual user
        return Registration.objects.create(**validated_data)
