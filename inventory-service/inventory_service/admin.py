from django.contrib import admin
from .models import Arm


@admin.register(Arm)
class ArmAdmin(admin.ModelAdmin):
    list_display = [
        'serial_number', 
        'model', 
        'calibre', 
        'type', 
        'manufacturer'
    ]
    list_filter = ['type', 'manufacturer', 'calibre']
    search_fields = ['serial_number', 'model', 'manufacturer']
    ordering = ['serial_number']
    
    fieldsets = (
        ('Firearm Identification', {
            'fields': ('serial_number', 'model', 'manufacturer')
        }),
        ('Firearm Specifications', {
            'fields': ('type', 'calibre')
        }),
    )