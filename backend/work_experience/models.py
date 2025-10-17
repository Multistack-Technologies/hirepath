from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class WorkExperience(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='work_experiences')
    
    # Simple fields
    company_name = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "Current" if self.is_current else "Past"
        return f"{self.user.username} - {self.job_title} at {self.company_name} ({status})"

    def save(self, *args, **kwargs):
        # Auto-set is_current if end_date is not set
        if not self.end_date:
            self.is_current = True
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-start_date', '-end_date']