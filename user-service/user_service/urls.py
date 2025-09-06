from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import ApiRoot # Import the root view from the app

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API root endpoint
    path('api/', ApiRoot.as_view(), name='api-root'),

    # Include all URLs from the 'users' app, also prefixed with 'api/'
    path('api/', include('users.urls')),
    
    # DRF browsable API login
    path('api-auth/', include('rest_framework.urls')),
]

# This part for serving static files in development remains the same.
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)