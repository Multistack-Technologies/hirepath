from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Education(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='educations')
    university = models.ForeignKey('universities.University', on_delete=models.CASCADE, related_name='educations')
    degree = models.ForeignKey('degrees.Degree', on_delete=models.CASCADE, related_name='educations')
    
    # Education details
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    
    # Academic performance
    gpa = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(4.0)],
        blank=True, 
        null=True
    )
    gpa_scale = models.FloatField(
        default=4.0,
        validators=[MinValueValidator(1.0), MaxValueValidator(10.0)]
    )
    
    # Additional information
    description = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "Current" if self.is_current else "Completed"
        return f"{self.user.username} - {self.degree.name} at {self.university.name} ({status})"

    def save(self, *args, **kwargs):
        # Auto-set is_current if end_date is not set
        if not self.end_date:
            self.is_current = True
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-start_date', '-end_date']
        unique_together = ['user', 'university', 'degree', 'start_date']