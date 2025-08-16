from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArmViewSet

router = DefaultRouter()
router.register(r'arms', ArmViewSet, basename='arm')

urlpatterns = [
    path('', include(router.urls)),
    
    # If you want to add any additional custom URLs that aren't covered by the ViewSet
    # path('custom-url/', custom_view, name='custom-view'),
]