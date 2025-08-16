from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Arm
from .serializers import ArmSerializer

class ArmViewSet(ModelViewSet):
    queryset = Arm.objects.all().order_by('serial_number')
    serializer_class = ArmSerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        queryset = self.get_queryset()
        data = {
            'summary': {
                'total_firearms': queryset.count(),
            },
            'type_statistics': list(
                queryset.values('type').annotate(count=Count('id')).order_by('-count')
            ),
            'manufacturer_statistics': list(
                queryset.values('manufacturer').annotate(count=Count('id')).order_by('-count')[:10]
            ),
            'calibre_statistics': list(
                queryset.values('calibre').annotate(count=Count('id')).order_by('-count')
            ),
        }
        return Response(data)