from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Roles(models.TextChoices):
        GRADUATE = "GRADUATE", "Graduate"
        RECRUITER = "RECRUITER", "Recruiter"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.GRADUATE
    )

    skills = models.ManyToManyField("skills.Skill", blank=True, related_name="users")

    def __str__(self):
        return f"{self.username} ({self.first_name} {self.last_name})"