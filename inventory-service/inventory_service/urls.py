from django.contrib import admin  # <-- Add this import
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArmViewSet

router = DefaultRouter()
router.register(r'arms', ArmViewSet, basename='arm')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]