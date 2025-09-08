# requisitions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RequisitionViewSet

router = DefaultRouter()
router.register(r"requisitions", RequisitionViewSet, basename="requisition")

urlpatterns = [
    path("api/", include(router.urls)),
]
