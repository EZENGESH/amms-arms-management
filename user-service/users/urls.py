from django.urls import path
from . import views

# These URL patterns are all related to the 'users' app.
urlpatterns = [
    # --- Authentication ---
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # FIX: This endpoint is for other services to validate a token and get user details.
    # It should point to UserDetailView.
    path('auth/user/', views.UserDetailView.as_view(), name='auth-user-detail'),

    # --- User Management ---
    # FIX: This endpoint is for admins to get a list of all users.
    path('users/', views.UserListView.as_view(), name='user-list-admin'),
    
    # FIX: This endpoint is for a logged-in user to get their own profile.
    # Your frontend should call this instead of the admin list view.
    path('users/profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    path('users/update_profile/', views.UpdateProfileView.as_view(), name='update-profile'),
    
    # --- Registration Flow ---
    path('registrations/', views.RegistrationAPIView.as_view(), name='registration-create'),
    path('registrations/list/', views.RegistrationListView.as_view(), name='registration-list'),
    path('registrations/<int:pk>/approve/', views.RegistrationApproveView.as_view(), name='registration-approve'),
    path('registrations/<int:pk>/reject/', views.RegistrationRejectView.as_view(), name='registration-reject'),
]