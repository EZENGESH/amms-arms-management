from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    """
    Custom user manager for creating users and superusers with service number and rank
    """
    def create_user(self, username, email, password=None, **extra_fields):
        """
        Create and return a regular user with an email and password
        """
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        Create and return a superuser with an email and password
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        # If service_number is not provided, set a default one
        if not extra_fields.get('service_number'):
            extra_fields['service_number'] = f"ADMIN-{username.upper()}"
        
        # If rank is not provided, set a default one
        if not extra_fields.get('rank'):
            extra_fields['rank'] = 'Administrator'
        
        return self.create_user(username, email, password, **extra_fields)


class CustomUser(AbstractUser):
    """
    Custom user model with service number and rank fields
    """
    service_number = models.CharField(max_length=100, unique=True)
    rank = models.CharField(max_length=100)
    email = models.EmailField(_('email address'), unique=True)
    
    # Required fields when using a custom user model
    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['email', 'service_number', 'rank', 'first_name', 'last_name']
    
    objects = CustomUserManager()
    
    def __str__(self):
        return f"{self.username} - {self.service_number} - {self.rank}"
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')


class Registration(models.Model):
    """
    Registration model for tracking registration requests
    This can be used for pending registrations that need approval
    """
    service_number = models.CharField(max_length=100, unique=True)
    rank = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=128)  # Store hashed password
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} - {self.service_number}"

    class Meta:
        verbose_name_plural = "Registrations"
