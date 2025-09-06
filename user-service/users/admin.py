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
    list_display = (
        'username', 'email', 'first_name', 'last_name',
        'service_number', 'rank', 'is_active', 'is_staff'
    )
    list_filter = ('rank', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'service_number')
    ordering = ('username',)

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
    list_display = (
        'username', 'email', 'first_name', 'last_name',
        'service_number', 'rank', 'is_approved', 'created_at'
    )
    list_filter = ('rank', 'is_approved', 'created_at', 'updated_at')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'service_number')
    ordering = ('-created_at',)

    # Use display_password instead of raw password
    readonly_fields = ('created_at', 'updated_at', 'display_password')

    fieldsets = (
        ('Registration Info', {
            'fields': ('username', 'email', 'service_number', 'rank'),
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name'),
        }),
        ('Password', {
            'fields': ('display_password',),
            'description': 'Stored password (hashed). Cannot be edited or viewed in plain text.',
        }),
        ('Status', {
            'fields': ('is_approved',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    actions = ['approve_registrations', 'reject_registrations']

    def display_password(self, obj):
        """
        Mask the password field in the admin panel.
        """
        return "********" if obj.password else "(no password set)"
    display_password.short_description = "Password"

    def approve_registrations(self, request, queryset):
        """
        Approve selected registrations and create corresponding users.
        """
        count = 0
        for registration in queryset.filter(is_approved=False):
            try:
                user_data = {
                    'username': registration.username,
                    'email': registration.email,
                    'first_name': registration.first_name,
                    'last_name': registration.last_name,
                    'service_number': registration.service_number,
                    'rank': registration.rank,
                }

                # Create user with hashed password (already stored in registration.password)
                user = User.objects.create_user(
                    password=registration.password,
                    **user_data
                )

                registration.is_approved = True
                registration.save()
                count += 1

            except Exception as e:
                self.message_user(
                    request,
                    f"Failed to approve {registration.username}: {str(e)}",
                    level='ERROR'
                )

        if count > 0:
            self.message_user(request, f"Successfully approved {count} registrations.")

    approve_registrations.short_description = "Approve selected registrations"

    def reject_registrations(self, request, queryset):
        """
        Reject (delete) selected registrations that are not yet approved.
        """
        count = queryset.filter(is_approved=False).count()
        queryset.filter(is_approved=False).delete()
        self.message_user(request, f"Successfully rejected {count} registrations.")

    reject_registrations.short_description = "Reject selected registrations"