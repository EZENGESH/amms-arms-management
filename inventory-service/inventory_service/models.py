from django.db import models


class Arm(models.Model):
    # Firearm type choices
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
        default='UNKNOWN',
        verbose_name="Serial Number"
    )
    model = models.CharField(
        max_length=100,
        default='Unknown Model',
        verbose_name="Model"
    )
    calibre = models.CharField(
        max_length=50,
        default='Unknown',
        verbose_name="Calibre"
    )
    type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
        default='other',
        verbose_name="Type"
    )
    manufacturer = models.CharField(
        max_length=100,
        default='Unknown',
        verbose_name="Manufacturer"
    )

    class Meta:
        ordering = ['serial_number']
        verbose_name = "Firearm"
        verbose_name_plural = "Firearms"

    def __str__(self):
        return f"{self.manufacturer} {self.model} ({self.serial_number})"

    @classmethod
    def get_by_type(cls, firearm_type):
        """Get firearms by type"""
        return cls.objects.filter(type=firearm_type)

    @classmethod
    def get_by_manufacturer(cls, manufacturer):
        """Get firearms by manufacturer"""
        return cls.objects.filter(manufacturer=manufacturer)

    @classmethod
    def get_by_calibre(cls, calibre):
        """Get firearms by calibre"""
        return cls.objects.filter(calibre=calibre)
