from django.db.models import Count
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Arm
from .serializers import ArmSerializer
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

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
                    queryset.exclude(calibre__isnull=True)
                    .values('calibre')
                    .annotate(count=Count('id'))
                    .order_by('-count')
                ),
            }
            return Response(data)
        except Exception as e:
            logger.error(f"Dashboard error: {str(e)}")
            return Response({
                'summary': {'total_firearms': 0},
                'type_statistics': [],
                'manufacturer_statistics': [],
                'calibre_statistics': []
            }, status=status.HTTP_200_OK)

       @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        Search firearms by model, serial_number, manufacturer, or calibre.
        Example: /api/arms/search/?q=ak
        """
        query = request.query_params.get('q', '').strip()
        queryset = self.get_queryset()
        if query:
            queryset = queryset.filter(
                Q(model__icontains=query) |
                Q(serial_number__icontains=query) |
                Q(manufacturer__icontains=query) |
                Q(calibre__icontains=query)
            )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)