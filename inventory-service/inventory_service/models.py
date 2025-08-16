from django.db import models

class Arm(models.Model):
    TYPE_CHOICES = [
        ('pistol', 'Pistol'),
        ('rifle', 'Rifle'),
        ('shotgun', 'Shotgun'),
        ('submachine_gun', 'Submachine Gun'),
        ('sniper_rifle', 'Sniper Rifle'),
        ('grenade_launcher', 'Grenade Launcher'),
        ('revolver', 'Revolver'),
        ('assault_rifle', 'Assault Rifle'),
        ('other', 'Other'),
    ]

    serial_number = models.CharField(
        max_length=100, 
        unique=True,
        verbose_name="Serial Number"
    )  # Removed default='UNKNOWN'

    model = models.CharField(
        max_length=100,
        verbose_name="Model"
    )  # Removed default='Unknown Model'

    calibre = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Calibre"
    )  # Made optional

    type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
        verbose_name="Type"
    )  # Removed default='other'

    manufacturer = models.CharField(
        max_length=100,
        verbose_name="Manufacturer"
    )  # Removed default='Unknown'

    class Meta:
        ordering = ['serial_number']
        verbose_name = "Firearm"
        verbose_name_plural = "Firearms"

    def __str__(self):
        return f"{self.manufacturer} {self.model} ({self.serial_number})"