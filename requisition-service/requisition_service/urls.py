from django.contrib import admin
from django.urls import path, include # Make sure include is imported

urlpatterns = [
    path('admin/', admin.site.urls),
    # FIX: Include the URLs from the 'requisitions' app under the 'api/' path.
    # This removes the need to import views directly into this file.
    path('api/', include('requisitions.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
