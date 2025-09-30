from django.db import models
from django.conf import settings
from jobs.models import Job

User = settings.AUTH_USER_MODEL

class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        REVIEWED = "REVIEWED", "Reviewed"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("job", "applicant")  # prevent duplicate applications

    def __str__(self):
        return f"{self.applicant.username} → {self.job.title} ({self.status})"
