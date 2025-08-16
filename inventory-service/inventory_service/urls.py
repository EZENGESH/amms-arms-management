from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArmViewSet

router = DefaultRouter()
router.register(r'arms', ArmViewSet, basename='arm')

urlpatterns = [
    path('', include(router.urls)),
    
]