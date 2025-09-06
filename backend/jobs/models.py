from django.db import models
from django.conf import settings
from companies.models import Company
from skills.models import Skill   # 👈 new import

User = settings.AUTH_USER_MODEL

class Job(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="jobs")
    location = models.CharField(max_length=255)
    skills_required = models.ManyToManyField(Skill, blank=True, related_name="jobs")  
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="jobs")

    def __str__(self):
        return f"{self.title} @ {self.company.name}"
