from django.db import models
from django.conf import settings
from certificate_providers.models import CertificateProvider
from companies.models import Company
from skills.models import Skill

from degrees.models import Degree

User = settings.AUTH_USER_MODEL

class Job(models.Model):
    EMPLOYMENT_TYPES = [
        ('FULL_TIME', 'Full-time'),
        ('PART_TIME', 'Part-time'),
        ('CONTRACT', 'Contract'),
        ('FREELANCE', 'Freelance'),
        ('INTERNSHIP', 'Internship'),
        ('TEMPORARY', 'Temporary'),
    ]
    
    WORK_TYPES = [
        ('ONSITE', 'On-site'),
        ('REMOTE', 'Remote'),
        ('HYBRID', 'Hybrid'),
    ]
    
    EXPERIENCE_LEVELS = [
        ('ENTRY', 'Entry Level (0-2 years)'),
        ('MID', 'Mid Level (2-5 years)'),
        ('SENIOR', 'Senior Level (5+ years)'),
        ('LEAD', 'Lead/Manager'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="jobs")
    location = models.CharField(max_length=255)
    
    # New fields
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPES, default='FULL_TIME')
    work_type = models.CharField(max_length=20, choices=WORK_TYPES, default='ONSITE')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS, default='MID')
    
    # Salary range
    min_salary = models.IntegerField(blank=True, null=True, help_text="Minimum annual salary in USD")
    max_salary = models.IntegerField(blank=True, null=True, help_text="Maximum annual salary in USD")
    
    # Dates
    closing_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Relationships
    skills_required = models.ManyToManyField(Skill, blank=True, related_name="jobs")
    certificates_preferred = models.ManyToManyField(CertificateProvider, blank=True, related_name="jobs")
    courses_preferred = models.ManyToManyField(Degree, blank=True, related_name="jobs")
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="jobs")

    def __str__(self):
        return f"{self.title} @ {self.company.name}"
    
    @property
    def is_active(self):
        """Check if job is still active based on closing date"""
        from django.utils import timezone
        from datetime import date
        if not self.closing_date:
            return True
        return self.closing_date >= date.today()

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employment_type']),
            models.Index(fields=['work_type']),
            models.Index(fields=['experience_level']),
            models.Index(fields=['closing_date']),
        ]