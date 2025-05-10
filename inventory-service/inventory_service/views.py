from rest_framework.viewsets import ModelViewSet
from .models import Arm
from .serializers import ArmSerializer

class ArmViewSet(ModelViewSet):
    queryset = Arm.objects.all()
    serializer_class = ArmSerializer
