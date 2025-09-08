from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Include the requisitions app URLs under the 'api/' prefix
    path('api/', include('requisitions.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
