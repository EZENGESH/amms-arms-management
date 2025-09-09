# project_root/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import ApiRoot

urlpatterns = [
    path('admin/', admin.site.urls),

    # API root
    path('api/', ApiRoot.as_view(), name='api-root'),

    # Versioned API
    path('api/v1/', include('users.urls')),  # ✅ add versioning here

    # DRF browsable API login
    path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
