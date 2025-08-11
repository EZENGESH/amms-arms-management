from rest_framework import serializers
from .models import Arm


class ArmSerializer(serializers.ModelSerializer):
    # Add display field for type choices
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Arm
        fields = [
            'id',
            'serial_number',
            'model',
            'calibre',
            'type',
            'type_display',
            'manufacturer'
        ]

    def validate_serial_number(self, value):
        """Ensure serial number is unique"""
        if self.instance and self.instance.serial_number == value:
            return value
        if Arm.objects.filter(serial_number=value).exists():
            raise serializers.ValidationError("Serial number must be unique.")
        return value
