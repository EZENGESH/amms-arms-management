import requests
from django.http import JsonResponse
from rest_framework.views import APIView
from django.conf import settings

SERVICES = {
    "user": "http://user-service:8000",
    "inventory": "http://inventory-service:8000",
    "requisition": "http://requisition-service:8000",
    "reporting": "http://reporting-service:8000"
}

class ProxyView(APIView):
    def get(self, request, service_name, path=''):
        return self.proxy_request(request, service_name, path)

    def post(self, request, service_name, path=''):
        return self.proxy_request(request, service_name, path, method="post")

    def proxy_request(self, request, service_name, path, method="get"):
        base_url = SERVICES.get(service_name)
        if not base_url:
            return JsonResponse({"error": "Unknown service"}, status=404)

        url = f"{base_url}/{path}"
        try:
            if method == "get":
                resp = requests.get(url, params=request.GET)
            elif method == "post":
                resp = requests.post(url, json=request.data)

            return JsonResponse(resp.json(), status=resp.status_code, safe=False)
        except requests.ConnectionError:
            return JsonResponse({"error": "Service unavailable"}, status=503)
