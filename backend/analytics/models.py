# analytics/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class RecruitmentReport(models.Model):
    REPORT_TYPES = [
        ('APPLICATION_ANALYSIS', 'Application Analysis'),
        ('CANDIDATE_PIPELINE', 'Candidate Pipeline'),
        ('TIME_TO_HIRE', 'Time to Hire'),
        ('SOURCE_ANALYSIS', 'Source Analysis'),
        ('SKILL_GAP_ANALYSIS', 'Skill Gap Analysis'),
        ('PERFORMANCE_DASHBOARD', 'Performance Dashboard'),
        ('CUSTOM', 'Custom')
    ]
    
    EXPORT_FORMATS = [
        ('PDF', 'PDF'),
        ('EXCEL', 'Excel'),
        ('CSV', 'CSV'),
        ('JSON', 'JSON')
    ]
    
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="analytics_reports")
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    description = models.TextField(blank=True, null=True)
    
    # Date range for the report
    date_range_start = models.DateField()
    date_range_end = models.DateField()
    
    # Filters applied
    filters_applied = models.JSONField(default=dict, blank=True)
    
    # Report data
    report_data = models.JSONField(default=dict)
    
    # Export information
    export_format = models.CharField(max_length=10, choices=EXPORT_FORMATS, blank=True, null=True)
    exported_file = models.FileField(upload_to='reports/exports/', blank=True, null=True)
    is_exported = models.BooleanField(default=False)
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['recruiter', 'report_type']),
            models.Index(fields=['generated_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recruiter.username}"

class DashboardView(models.Model):
    """Store recruiter dashboard configurations"""
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dashboards")
    name = models.CharField(max_length=255)
    widget_config = models.JSONField(default=dict)  # Store widget positions and types
    filters = models.JSONField(default=dict)  # Default filters for this dashboard
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['recruiter', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.recruiter.username}"

class AnalyticsExport(models.Model):
    """Track export requests and results"""
    EXPORT_TYPES = [
        ('APPLICATIONS', 'Applications'),
        ('CANDIDATES', 'Candidates'),
        ('JOBS', 'Jobs'),
        ('ANALYTICS', 'Analytics')
    ]
    
    FORMAT_CHOICES = [
        ('EXCEL', 'Excel'),
        ('CSV', 'CSV'),
        ('PDF', 'PDF'),
        ('JSON', 'JSON')
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    ]
    
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="exports")
    export_type = models.CharField(max_length=20, choices=EXPORT_TYPES)
    filters = models.JSONField(default=dict)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='EXCEL')
    file = models.FileField(upload_to='exports/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.export_type} - {self.recruiter.username}"