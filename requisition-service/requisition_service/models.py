from django.db import models

class Requisition(models.Model):
    requester_id = models.IntegerField()  # Normally a FK to User
    arm_id = models.IntegerField()        # Normally a FK to Arm
    quantity = models.PositiveIntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('denied', 'Denied'),
    ], default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Requisition {self.id} - {self.status}"
