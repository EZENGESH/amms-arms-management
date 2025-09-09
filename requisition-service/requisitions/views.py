from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Requisition
from .serializers import RequisitionSerializer

class RequisitionViewSet(ModelViewSet):
    queryset = Requisition.objects.all()
    serializer_class = RequisitionSerializer
    permission_classes = [IsAuthenticated]
