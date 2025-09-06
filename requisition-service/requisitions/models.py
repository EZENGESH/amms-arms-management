from django.db import models

class Requisition(models.Model):
    service_number = models.CharField(max_length=100, default='')
    rank = models.CharField(max_length=100, default='')
    name = models.CharField(max_length=100, default='')
    station_unit = models.CharField(max_length=100, default='')
    firearm_type = models.CharField(max_length=100, default='')
    quantity = models.IntegerField(default=0)

    class Meta:
        db_table = 'requisition_service_requisition'

    def __str__(self):
        return f"{self.name} - {self.service_number}"
