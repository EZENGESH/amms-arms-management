from django.db.models import Count  # Add this import
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Arm
from .serializers import ArmSerializer

class ArmViewSet(ModelViewSet):
    queryset = Arm.objects.all().order_by('serial_number')
    serializer_class = ArmSerializer

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        try:
            queryset = self.get_queryset()
            data = {
                'summary': {
                    'total_firearms': queryset.count(),
                },
                'type_statistics': list(
                    queryset.values('type')
                    .annotate(count=Count('id'))
                    .order_by('-count')
                ),
                'manufacturer_statistics': list(
                    queryset.values('manufacturer')
                    .annotate(count=Count('id'))
                    .order_by('-count')[:10]
                ),
                'calibre_statistics': list(
                    queryset.values('calibre')
                    .annotate(count=Count('id'))
                    .order_by('-count')
                ),
            }
            return Response(data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )