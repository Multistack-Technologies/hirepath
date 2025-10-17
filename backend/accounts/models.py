from django.db import models
from django.contrib.auth.models import AbstractUser
import os
from django.utils import timezone

def user_avatar_upload_path(instance, filename):
    # Generate path: avatars/user_{id}/{timestamp}_{filename}
    timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
    ext = filename.split('.')[-1]
    filename = f"avatar_{timestamp}.{ext}"
    return os.path.join('avatars', f'user_{instance.id}', filename)

class User(AbstractUser):
    class Roles(models.TextChoices):
        GRADUATE = "GRADUATE", "Graduate"
        RECRUITER = "RECRUITER", "Recruiter"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.GRADUATE
    )
    
    # New fields
    linkedin_url = models.URLField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location = models.JSONField(blank=True, null=True)
    avatar = models.ImageField(
        upload_to=user_avatar_upload_path, 
        blank=True, 
        null=True,
        max_length=500
    )
    bio = models.TextField(blank=True, null=True)
    job_title = models.CharField(max_length=100, blank=True, null=True)

   
       # Relationships
    skills = models.ManyToManyField("skills.Skill", blank=True, related_name="users")
    target_job_roles = models.ManyToManyField("job_roles.JobRole", blank=True, related_name="users_targeting")
    current_job_role = models.ForeignKey("job_roles.JobRole", on_delete=models.SET_NULL, null=True, blank=True, related_name="users_current")

    def __str__(self):
        return f"{self.username} ({self.first_name} {self.last_name})"
    
    @property
    def avatarUrl(self):
        if self.avatar and hasattr(self.avatar, 'url'):
            return self.avatar.url
        return None
    
    def save(self, *args, **kwargs):
        # If this is a new user, save first to get an ID
        if self.pk is None:
            saved_avatar = self.avatar
            self.avatar = None
            super().save(*args, **kwargs)
            self.avatar = saved_avatar
            # Save again if there's an avatar
            if saved_avatar:
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)