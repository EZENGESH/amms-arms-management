from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, F, Case, When, IntegerField
from django.core.cache import cache
from django.db.utils import DatabaseError, OperationalError  # <-- Added import
from .models import Arm
from .serializers import ArmSerializer
import logging

logger = logging.getLogger(__name__)

class ArmViewSet(ModelViewSet):
    """
    Enhanced ViewSet for firearms inventory with:
    - CRUD operations
    - Advanced filtering
    - Caching
    - Better error handling
    - Performance optimizations
    """
    queryset = Arm.objects.all()
    serializer_class = ArmSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'manufacturer', 'calibre']  # Removed 'status' (not in model)
    search_fields = ['serial_number', 'model', 'manufacturer', 'calibre']  # Removed 'notes' (not in model)
    ordering_fields = ['serial_number', 'model', 'manufacturer', 'type']  # Removed 'date_acquired' (not in model)
    ordering = ['serial_number']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        """Override queryset to add custom filtering"""
        queryset = super().get_queryset()
        # Removed filter(is_public=True) since 'is_public' does not exist in Arm model
        return queryset

    def perform_create(self, serializer):
        """Auto-set owner on creation if owner field exists"""
        # Only set owner if the model has an owner field
        if hasattr(serializer.Meta.model, 'owner'):
            serializer.save(owner=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get firearms filtered by type with stats"""
        firearm_type = request.query_params.get('type')
        if not firearm_type:
            return Response(
                {'error': 'Type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            cache_key = f'arms_by_type_{firearm_type}'
            data = cache.get(cache_key)
            if not data:
                arms = self.filter_queryset(
                    self.get_queryset().filter(type__iexact=firearm_type)
                )
                serializer = self.get_serializer(arms, many=True)
                data = serializer.data
                cache.set(cache_key, data, timeout=60*15)  # Cache for 15 minutes
            return Response(data)
        except Exception as e:
            logger.error(f"Error in by_type: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve firearms by type'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Enhanced search with pagination and relevance sorting"""
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response(
                {'error': 'Search query parameter "q" is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            # Basic search
            arms = self.get_queryset().filter(
                Q(serial_number__icontains=query) |
                Q(model__icontains=query) |
                Q(manufacturer__icontains=query) |
                Q(calibre__icontains=query) |
                Q(type__icontains=query)
            ).distinct()

            # Add relevance scoring
            arms = arms.annotate(
                relevance=Count(
                    Case(
                        When(serial_number__iexact=query, then=1),
                        When(model__iexact=query, then=1),
                        When(manufacturer__iexact=query, then=1),
                        default=0,
                        output_field=IntegerField()
                    )
                )
            ).order_by('-relevance', 'serial_number')

            page = self.paginate_queryset(arms)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(arms, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            return Response(
                {'error': 'Search failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Enhanced dashboard with caching and additional stats"""
        try:
            cache_key = 'arms_dashboard_data'
            data = cache.get(cache_key)
            if not data:
                queryset = self.get_queryset()
                data = {
                    'summary': {
                        'total_firearms': queryset.count(),
                        # 'active' and 'archived' require a 'status' field, which does not exist
                    },
                    'type_statistics': list(
                        queryset.values('type').annotate(
                            count=Count('id'),
                            models=Count('model', distinct=True)
                        ).order_by('-count')
                    ),
                    'manufacturer_statistics': list(
                        queryset.values('manufacturer').annotate(
                            count=Count('id'),
                            types=Count('type', distinct=True)
                        ).order_by('-count')[:10]  # Top 10 manufacturers
                    ),
                    'calibre_statistics': list(
                        queryset.values('calibre').annotate(
                            count=Count('id')
                        ).order_by('-count')
                    ),
                    # 'acquisition_trends' requires 'date_acquired', which does not exist in model
                }
                cache.set(cache_key, data, timeout=60*30)  # Cache for 30 minutes
            return Response(data)
        except Exception as e:
            logger.error(f"Dashboard error: {str(e)}")
            return Response(
                {'error': 'Failed to generate dashboard data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export firearms data in various formats"""
        format = request.query_params.get('format', 'json')
        queryset = self.filter_queryset(self.get_queryset())
        if format == 'csv':
            # Implement CSV export logic
            pass
        elif format == 'xlsx':
            # Implement Excel export logic
            pass
        else:
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

    def handle_exception(self, exc):
        """Custom exception handling"""
        logger.error(f"API Exception: {str(exc)}")
        if isinstance(exc, (DatabaseError, OperationalError)):
            return Response(
                {'error': 'Database error occurred'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        return super().handle_exception(exc)