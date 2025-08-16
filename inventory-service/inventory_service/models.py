from django.db import models

class Arm(models.Model):
    TYPE_CHOICES = [
        ('pistol', 'Pistol'),
        ('rifle', 'Rifle'),
        ('shotgun', 'Shotgun'),
        ('submachine_gun', 'Submachine Gun'),
        ('sniper_rifle', 'Sniper Rifle'),
        ('other', 'Other'),
    ]

    serial_number = models.CharField(
        max_length=100, 
        unique=True,
        verbose_name="Serial Number"
    )
    model = models.CharField(
        max_length=100,
        verbose_name="Model"
    )
    calibre = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Calibre"
    )
    type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
        verbose_name="Type"
    )
    manufacturer = models.CharField(
        max_length=100,
        verbose_name="Manufacturer"
    )

    class Meta:
        ordering = ['serial_number']
        verbose_name = "Firearm"
        verbose_name_plural = "Firearms"

    def __str__(self):
        return f"{self.manufacturer} {self.model} ({self.serial_number})"