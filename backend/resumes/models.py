# backend/resumes/models.py
from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator
import os

User = settings.AUTH_USER_MODEL

def resume_upload_path(instance, filename):

    return os.path.join('resumes', str(instance.user.id), filename)

class Resume(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='resume')
    file = models.FileField(
        upload_to=resume_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # --- AI Feedback Fields ---
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  
    skills_detected = models.JSONField(null=True, blank=True)  
    missing_skills = models.JSONField(null=True, blank=True)   
    feedback = models.JSONField(null=True, blank=True)  
    job_role_matched = models.CharField(max_length=100, blank=True) 
    

    extracted_text = models.TextField(blank=True)

    def __str__(self):
        return f"Resume - {self.user.username}"

    class Meta:
        ordering = ['-uploaded_at']