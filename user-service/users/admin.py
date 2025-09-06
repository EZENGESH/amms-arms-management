from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import Registration, CustomUser

User = get_user_model()


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Admin configuration for CustomUser model
    """
    # Fields to display in the user list
    list_display = ('username', 'email', 'first_name', 'last_name', 'service_number', 'rank', 'is_active', 'is_staff')
    
    # Fields to filter by
    list_filter = ('rank', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    
    # Fields to search
    search_fields = ('username', 'email', 'first_name', 'last_name', 'service_number')
    
    # Fields to order by
    ordering = ('username',)
    
    # Fields for the add form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email', 'service_number', 'rank'),
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
    )
    
    # Fields for the change form
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email', 'service_number', 'rank'),
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    """
    Admin configuration for Registration model
    """
    # Fields to display in the registration list
    list_display = ('username', 'email', 'first_name', 'last_name', 'service_number', 'rank', 'is_approved', 'created_at')
    
    # Fields to filter by
    list_filter = ('rank', 'is_approved', 'created_at', 'updated_at')
    
    # Fields to search
    search_fields = ('username', 'email', 'first_name', 'last_name', 'service_number')
    
    # Fields to order by
    ordering = ('-created_at',)
    
    # Read-only fields
    readonly_fields = ('created_at', 'updated_at', 'password')
    
    # Fields for the form
    fieldsets = (
        ('Registration Info', {
            'fields': ('username', 'email', 'service_number', 'rank'),
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name'),
        }),
        ('Password', {
            'fields': ('password',),
            'description': 'Password is hashed and cannot be displayed.',
        }),
        ('Status', {
            'fields': ('is_approved',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    # Custom actions
    actions = ['approve_registrations', 'reject_registrations']
    
    def approve_registrations(self, request, queryset):
        """
        Admin action to approve selected registrations
        """
        count = 0
        for registration in queryset.filter(is_approved=False):
            try:
                # Create user from registration
                user_data = {
                    'username': registration.username,
                    'email': registration.email,
                    'first_name': registration.first_name,
                    'last_name': registration.last_name,
                    'service_number': registration.service_number,
                    'rank': registration.rank,
                }
                
                user = User.objects.create_user(
                    password=registration.password,  # Already hashed
                    **user_data
                )
                
                registration.is_approved = True
                registration.save()
                count += 1
                
            except Exception as e:
                self.message_user(request, f"Failed to approve {registration.username}: {str(e)}", level='ERROR')
        
        if count > 0:
            self.message_user(request, f"Successfully approved {count} registrations.")
    
    approve_registrations.short_description = "Approve selected registrations"
    
    def reject_registrations(self, request, queryset):
        """
        Admin action to reject (delete) selected registrations
        """
        count = queryset.filter(is_approved=False).count()
        queryset.filter(is_approved=False).delete()
        self.message_user(request, f"Successfully rejected {count} registrations.")
    
    reject_registrations.short_description = "Reject selected registrations"