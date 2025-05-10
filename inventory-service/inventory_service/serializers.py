from rest_framework import serializers
from .models import Arm

class ArmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Arm
        fields = '__all__'
