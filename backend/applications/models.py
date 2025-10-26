from django.db import models
from django.conf import settings
from jobs.models import Job
from django.utils import timezone
import logging
from typing import Dict, Any

# Import the Gemini AI engine
from ai.services import ai_engine

logger = logging.getLogger(__name__)
User = settings.AUTH_USER_MODEL

class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        REVIEWED = "REVIEWED", "Reviewed"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"
        INTERVIEW = "INTERVIEW", "Interview"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    match_score = models.FloatField(null=True, blank=True)
    
    # AI-enhanced fields
    ai_analysis = models.JSONField(null=True, blank=True, help_text="Detailed AI analysis of the application")
    ai_feedback = models.TextField(blank=True, null=True, help_text="AI-generated feedback for improvement")
    
    # Additional fields
    notes = models.TextField(blank=True, null=True, help_text="Recruiter notes about the application")
    interview_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ("job", "applicant")
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.applicant.username} → {self.job.title} ({self.status})"

    def save(self, *args, **kwargs):
        # Calculate match score when application is created or if score is None
        if not self.pk or self.match_score is None:
            self.match_score, self.ai_analysis, self.ai_feedback = self.calculate_ai_match_score()
        super().save(*args, **kwargs)

    def get_applicant_profile_data(self) -> Dict[str, Any]:
        """Extract structured data from applicant profile for AI analysis"""
        try:
            profile_data = {
                "skills": list(self.applicant.skills.values_list('name', flat=True)),
                "educations": [],
                "experiences": [],
                "certificates": [],
            }
            
            # Education data
            for edu in self.applicant.educations.all():
                profile_data["educations"].append({
                    "degree": edu.degree.name if edu.degree else "",
                    "institution": edu.institution,
                    "field_of_study": edu.field_of_study,
                    "graduation_year": edu.graduation_year
                })
            
            # Work experience data (for context)
            for exp in self.applicant.work_experiences.all():
                profile_data["experiences"].append({
                    "title": exp.title,
                    "company": exp.company,
                    "duration_months": exp.duration_months,
                    "description": exp.description
                })
            
            # Certificates
            for cert in self.applicant.certificates.all():
                profile_data["certificates"].append({
                    "name": cert.name,
                    "provider": cert.provider.name if cert.provider else "",
                    "year_obtained": cert.year_obtained
                })
            
            return profile_data
            
        except Exception as e:
            logger.error(f"Error extracting applicant profile data: {e}")
            return {}

    def get_job_requirements_data(self) -> Dict[str, Any]:
        """Extract structured data from job requirements"""
        try:
            job_data = {
                "title": self.job.title,
                "description": self.job.description,
                "requirements": self.job.requirements,
                "skills_required": list(self.job.skills_required.values_list('name', flat=True)),
                "experience_level": self.job.experience_level,
                "courses_preferred": list(self.job.courses_preferred.values_list('name', flat=True)),
                "certificates_preferred": list(self.job.certificates_preferred.values_list('name', flat=True)),
                "location": self.job.location,
                "job_type": self.job.job_type
            }
            return job_data
        except Exception as e:
            logger.error(f"Error extracting job requirements data: {e}")
            return {}

    def calculate_ai_match_score(self):
        """
        Use Gemini AI engine to calculate match score
        Returns: (match_score, analysis, feedback)
        """
        try:
            applicant_data = self.get_applicant_profile_data()
            job_data = self.get_job_requirements_data()
            
            if not applicant_data or not job_data:
                return 0.0, {}, "Insufficient data for analysis"
            
            # Use the Gemini AI engine service
            result = ai_engine.analyze_application_match(
                applicant_data=applicant_data,
                job_data=job_data,
                cover_letter=self.cover_letter or ""
            )
            
            return (
                result.get("match_score", 0.0),
                result.get("analysis", {}),
                result.get("feedback", "")
            )
            
        except Exception as e:
            logger.error(f"Gemini AI analysis failed: {e}")
            return 0.0, {}, f"Analysis error: {str(e)}"

    def refresh_ai_analysis(self):
        """Force refresh of AI analysis"""
        self.match_score, self.ai_analysis, self.ai_feedback = self.calculate_ai_match_score()
        self.save()

    def get_ai_enhanced_feedback(self) -> str:
        """Get AI-generated feedback for the application"""
        if self.ai_feedback:
            return self.ai_feedback
        
        # Regenerate if not available
        self.refresh_ai_analysis()
        return self.ai_feedback

    @property
    def is_highly_matched(self) -> bool:
        """Check if this is a highly matched application"""
        return self.match_score and self.match_score >= 80

    @property
    def needs_improvement(self) -> bool:
        """Check if application needs improvement"""
        return self.match_score and self.match_score < 60