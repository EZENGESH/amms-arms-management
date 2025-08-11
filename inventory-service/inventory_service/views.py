from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from .models import Arm
from .serializers import ArmSerializer


class ArmViewSet(ModelViewSet):
    """
    ViewSet for managing firearms inventory with CRUD operations
    """
    queryset = Arm.objects.all()
    serializer_class = ArmSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'manufacturer', 'calibre']
    search_fields = ['serial_number', 'model', 'manufacturer', 'calibre']
    ordering_fields = ['serial_number', 'model', 'manufacturer', 'type']
    ordering = ['serial_number']

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get firearms filtered by type"""
        firearm_type = request.query_params.get('type')
        if not firearm_type:
            return Response({
                'error': 'Please provide type parameter'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        arms = self.queryset.filter(type=firearm_type)
        serializer = self.get_serializer(arms, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_manufacturer(self, request):
        """Get firearms filtered by manufacturer"""
        manufacturer = request.query_params.get('manufacturer')
        if not manufacturer:
            return Response({
                'error': 'Please provide manufacturer parameter'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        arms = self.queryset.filter(manufacturer__icontains=manufacturer)
        serializer = self.get_serializer(arms, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_calibre(self, request):
        """Get firearms filtered by calibre"""
        calibre = request.query_params.get('calibre')
        if not calibre:
            return Response({
                'error': 'Please provide calibre parameter'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        arms = self.queryset.filter(calibre__icontains=calibre)
        serializer = self.get_serializer(arms, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search functionality"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({
                'error': 'Please provide search query parameter "q"'
            }, status=status.HTTP_400_BAD_REQUEST)

        arms = self.queryset.filter(
            Q(serial_number__icontains=query) |
            Q(model__icontains=query) |
            Q(manufacturer__icontains=query) |
            Q(calibre__icontains=query) |
            Q(type__icontains=query)
        )
        
        serializer = self.get_serializer(arms, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get dashboard data with statistics"""
        total_firearms_count = self.queryset.count()
        
        # Statistics by type
        type_stats = self.queryset.values('type').annotate(
            count=Count('id')
        ).order_by('type')
        
        # Statistics by manufacturer
        manufacturer_stats = self.queryset.values('manufacturer').annotate(
            count=Count('id')
        ).order_by('manufacturer')
        
        # Statistics by calibre
        calibre_stats = self.queryset.values('calibre').annotate(
            count=Count('id')
        ).order_by('calibre')
        
        return Response({
            'summary': {
                'total_firearms': total_firearms_count
            },
            'type_statistics': type_stats,
            'manufacturer_statistics': manufacturer_stats,
            'calibre_statistics': calibre_stats
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary statistics"""
        total_firearms = self.queryset.count()
        
        return Response({
            'total_firearms': total_firearms,
            'unique_types': self.queryset.values('type').distinct().count(),
            'unique_manufacturers': self.queryset.values('manufacturer').distinct().count(),
            'unique_calibres': self.queryset.values('calibre').distinct().count()
        })
