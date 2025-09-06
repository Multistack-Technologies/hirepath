from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255)
    created_by = models.OneToOneField(User, on_delete=models.CASCADE, related_name="company")

    def __str__(self):
        return self.name
