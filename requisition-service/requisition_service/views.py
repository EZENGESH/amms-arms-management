from rest_framework.viewsets import ModelViewSet
from .models import Requisition
from .serializers import RequisitionSerializer

class RequisitionViewSet(ModelViewSet):
    queryset = Requisition.objects.all()
    serializer_class = RequisitionSerializer
