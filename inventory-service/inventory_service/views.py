from django.db.models import Count
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Arm
from .serializers import ArmSerializer
import logging

logger = logging.getLogger(__name__)

class ArmViewSet(ModelViewSet):
    queryset = Arm.objects.all().order_by('serial_number')
    serializer_class = ArmSerializer

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        try:
            # Basic counts
            total_firearms = Arm.objects.count()
            
            # Type statistics - handle empty database case
            type_stats = list(
                Arm.objects.values('type')
                .annotate(count=Count('id'))
                .order_by('-count')
            ) or [{'type': 'none', 'count': 0}]
            
            # Manufacturer statistics
            manufacturer_stats = list(
                Arm.objects.values('manufacturer')
                .annotate(count=Count('id'))
                .order_by('-count')[:10]
            ) or [{'manufacturer': 'none', 'count': 0}]
            
            # Calibre statistics - handle null values
            calibre_stats = list(
                Arm.objects.exclude(calibre__isnull=True)
                .values('calibre')
                .annotate(count=Count('id'))
                .order_by('-count')
            ) or [{'calibre': 'none', 'count': 0}]

            data = {
                'summary': {
                    'total_firearms': total_firearms,
                },
                'type_statistics': type_stats,
                'manufacturer_statistics': manufacturer_stats,
                'calibre_statistics': calibre_stats,
            }
            return Response(data)
            
        except Exception as e:
            logger.error(f"Dashboard error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to generate dashboard data', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )