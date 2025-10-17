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
    
    # Basic AI Analysis
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  
    skills_detected = models.JSONField(null=True, blank=True)  
    missing_skills = models.JSONField(null=True, blank=True)   
    feedback = models.JSONField(null=True, blank=True)  
    job_role_matched = models.CharField(max_length=100, blank=True) 
    
    # Enhanced Analysis Fields
    extracted_text = models.TextField(blank=True)
    analysis_data = models.JSONField(null=True, blank=True)  # Store comprehensive analysis
    
    def __str__(self):
        return f"Resume - {self.user.username}"

    class Meta:
        ordering = ['-uploaded_at']

class CVAnalysis(models.Model):
    """Comprehensive CV Analysis Data"""
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name='cv_analysis')
    
    # Personal & Career Insights
    years_experience = models.IntegerField(null=True, blank=True)
    career_gap_months = models.IntegerField(default=0)
    job_stability_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    career_progression = models.JSONField(null=True, blank=True)
    
    # Education Analysis
    education_level = models.CharField(max_length=100, blank=True)
    institution_tier = models.CharField(max_length=50, blank=True)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    qualifications = models.JSONField(null=True, blank=True)
    
    # Skills & Competencies
    technical_skills = models.JSONField(null=True, blank=True)
    soft_skills = models.JSONField(null=True, blank=True)
    certifications = models.JSONField(null=True, blank=True)
    
    # Achievement Metrics
    achievements_count = models.IntegerField(default=0)
    quantifiable_achievements = models.JSONField(null=True, blank=True)
    leadership_experience = models.BooleanField(default=False)
    management_experience = models.BooleanField(default=False)
    
    # Industry & Market
    industry_experience = models.JSONField(null=True, blank=True)
    specialization_areas = models.JSONField(null=True, blank=True)
    market_demand_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Communication & Language
    languages = models.JSONField(null=True, blank=True)
    communication_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Red Flags & Strengths
    red_flags = models.JSONField(null=True, blank=True)
    strength_indicators = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CV Analysis - {self.resume.user.username}"

class JobMatch(models.Model):
    """Enhanced Job Matching"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_matches')
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    job_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True)
    match_score = models.DecimalField(max_digits=5, decimal_places=2)
    skills_match = models.JSONField()
    salary_range = models.JSONField()
    location = models.CharField(max_length=100)
    match_reasons = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-match_score']

class SAJobMarketData(models.Model):
    """South African Market Data"""
    job_title = models.CharField(max_length=200)
    skills_required = models.JSONField()
    average_salary_min = models.IntegerField()
    average_salary_max = models.IntegerField()
    location_demand = models.JSONField()
    experience_level = models.CharField(max_length=50)
    market_demand = models.DecimalField(max_digits=5, decimal_places=2)
    industry = models.CharField(max_length=100, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.job_title} - {self.experience_level}"