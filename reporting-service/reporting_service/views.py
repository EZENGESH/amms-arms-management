from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests

@api_view(['GET'])
def total_requisitions(request):
    try:
        res = requests.get("http://requisition-service:8000/api/requisitions/")
        data = res.json()
        return Response({'total_requisitions': len(data)})
    except:
        return Response({'error': 'Could not fetch requisitions'}, status=500)

@api_view(['GET'])
def arms_status_summary(request):
    try:
        res = requests.get("http://inventory-service:8000/api/arms/")
        data = res.json()
        status_count = {}
        for arm in data:
            status = arm['status']
            status_count[status] = status_count.get(status, 0) + 1
        return Response(status_count)
    except:
        return Response({'error': 'Could not fetch inventory'}, status=500)
