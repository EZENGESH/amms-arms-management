from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (RegisterViewSet, CustomTokenObtainPairView,)
from .views import SafeTokenObtainPairView

router = DefaultRouter()
router.register(r'register', RegisterViewSet, basename='register')

urlpatterns = [
    path('api/auth/login/', SafeTokenObtainPairView.as_view(), name='login'),
    path('api/', include(router.urls)),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('api/auth/register/', RegisterViewSet.as_view({'post': 'create'}), name='register'),
]