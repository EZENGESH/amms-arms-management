"""inventory_service URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from .views import ArmViewSet

# Create a router and register our ViewSet with it.
router = DefaultRouter()
router.register(r'arms', ArmViewSet, basename='arms')  # Added basename for clarity

# The API URL patterns are now determined automatically by the router.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # All API endpoints under /api/
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)