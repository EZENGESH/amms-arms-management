from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as token_views
from rest_framework import routers
from . import views

# API router
router = routers.DefaultRouter()

# Define URL patterns
urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API root endpoint
    path('', views.ApiRoot.as_view(), name='api-root'),
    
    # Authentication endpoints
    path('api/auth/login/', views.LoginView.as_view(), name='login'),
    path('api/auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('api/auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # User endpoints
    path('api/users/register/', views.RegisterView.as_view(), name='register'),
    path('api/users/', views.UserListView.as_view(), name='user-list'),
    path('api/users/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('api/users/update_profile/', views.UpdateProfileView.as_view(), name='update-profile'),
    
    # Registration endpoints
    path('api/registrations/', views.RegistrationAPIView.as_view(), name='registration-create'),
    path('api/registrations/list/', views.RegistrationListView.as_view(), name='registration-list'),
    path('api/registrations/<int:pk>/approve/', views.RegistrationApproveView.as_view(), name='registration-approve'),
    path('api/registrations/<int:pk>/reject/', views.RegistrationRejectView.as_view(), name='registration-reject'),
    
    # Include router URLs
    path('api/', include(router.urls)),
    
    # DRF browsable API login
    path('api-auth/', include('rest_framework.urls')),
]