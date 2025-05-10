from django.db import models

class Arm(models.Model):
    name = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=(
        ('available', 'Available'),
        ('assigned', 'Assigned'),
        ('maintenance', 'Maintenance'),
    ))

    def __str__(self):
        return f"{self.name} ({self.serial_number})"
