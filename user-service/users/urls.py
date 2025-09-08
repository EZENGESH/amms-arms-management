# users/urls.py
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView  
urlpatterns = [
    # Authentication
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('auth/user/', views.UserDetailView.as_view(), name='auth-user-detail'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User Management
    path('users/', views.UserListView.as_view(), name='user-list-admin'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/profile/update/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('users/<int:pk>/', views.UserRetrieveDeleteView.as_view(), name='user-detail-admin'),
    path('users/<int:pk>/update/', views.UserUpdateView.as_view(), name='user-update-admin'),

    # Registration Flow
    path('registrations/', views.RegistrationAPIView.as_view(), name='registration-create'),
    path('registrations/list/', views.RegistrationListView.as_view(), name='registration-list'),
    path('registrations/<int:pk>/approve/', views.RegistrationApproveView.as_view(), name='registration-approve'),
    path('registrations/<int:pk>/reject/', views.RegistrationRejectView.as_view(), name='registration-reject'),
]
