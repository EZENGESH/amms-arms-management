# urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # --- API Root ---
    path('', views.ApiRoot.as_view(), name='api-root'),

    # --- Authentication ---
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('auth/user/', views.UserDetailView.as_view(), name='user-detail'),

    # --- User Management ---
    path('users/register/', views.RegisterView.as_view(), name='register'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/update_profile/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('users/<int:pk>/update/', views.UserUpdateView.as_view(), name='user-update'),
    path('users/<int:pk>/', views.UserRetrieveDeleteView.as_view(), name='user-retrieve-delete'),

    # --- Registration Flow ---
    path('registrations/', views.RegistrationAPIView.as_view(), name='registration-create'),
    path('registrations/list/', views.RegistrationListView.as_view(), name='registration-list'),
    path('registrations/<int:pk>/approve/', views.RegistrationApproveView.as_view(), name='registration-approve'),
    path('registrations/<int:pk>/reject/', views.RegistrationRejectView.as_view(), name='registration-reject'),
]
