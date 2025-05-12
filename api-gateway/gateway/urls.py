from django.urls import path, re_path
from .views import ProxyView

urlpatterns = [
    re_path(r'^api/(?P<service_name>\w+)/(?P<path>.*)$', ProxyView.as_view()),
]
