from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

def resume_upload_path(instance, filename):
    return f"resumes/{instance.user.id}/{filename}"

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to=resume_upload_path)
    file_name = models.CharField(max_length=255, blank=True)
    file_type = models.CharField(max_length=20, blank=True)
    text = models.TextField(blank=True, null=True)           # extracted plain text
    ai_feedback = models.JSONField(blank=True, null=True)    # { score, strengths, weaknesses, suggestions, missing_skills }
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.file and not self.file_name:
            self.file_name = self.file.name.split('/')[-1]
            ext = self.file_name.split('.')[-1] if '.' in self.file_name else ''
            self.file_type = ext.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} - {self.file_name or 'resume'}"
