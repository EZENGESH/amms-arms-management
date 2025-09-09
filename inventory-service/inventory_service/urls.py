from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArmViewSet
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def health_check(request):
    return JsonResponse({"status": "ok"})

router = DefaultRouter()
router.register(r'arms', ArmViewSet, basename='arm')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/health/', health_check),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)