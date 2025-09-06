from django.urls import path
from . import views

# These URL patterns are all related to the 'users' app.
urlpatterns = [
    # API Root
    path('', views.ApiRoot.as_view(), name='api-root'),

    # Authentication endpoints
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    # Endpoint for other services to validate tokens
    path('auth/user/', views.UserDetailView.as_view(), name='user-detail'),

    # User management endpoints
    path('users/register/', views.RegisterView.as_view(), name='register'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/update_profile/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('users/<int:pk>/', views.UserRetrieveDeleteView.as_view(), name='user-retrieve-delete'),  # NEW retrieve/delete
    path('users/<int:pk>/update/', views.UserUpdateView.as_view(), name='user-update'),  # Admin update

    # Registration endpoints for admin approval
    path('registrations/', views.RegistrationAPIView.as_view(), name='registration-create'),
    path('registrations/list/', views.RegistrationListView.as_view(), name='registration-list'),
    path('registrations/<int:pk>/approve/', views.RegistrationApproveView.as_view(), name='registration-approve'),
    path('registrations/<int:pk>/reject/', views.RegistrationRejectView.as_view(), name='registration-reject'),
]
