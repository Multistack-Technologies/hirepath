# backend/applications/models.py
from django.db import models
from django.conf import settings
from jobs.models import Job

User = settings.AUTH_USER_MODEL

class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        REVIEWED = "REVIEWED", "Reviewed"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"  # Added this
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    applied_at = models.DateTimeField(auto_now_add=True)
    match_score = models.FloatField(null=True, blank=True)  # Store calculated score

    class Meta:
        unique_together = ("job", "applicant")

    def __str__(self):
        return f"{self.applicant.username} → {self.job.title} ({self.status})"

    def save(self, *args, **kwargs):
        # Calculate match score when application is created
        if not self.pk or self.match_score is None:
            self.match_score = self.calculate_match_score()
        super().save(*args, **kwargs)

    def calculate_match_score(self):
        """
        Calculates and returns the match score dynamically.
        """
        try:
            # Get applicant's skills (assuming user has skills through profile)
            applicant_skills = set()
            if hasattr(self.applicant, 'profile') and hasattr(self.applicant.profile, 'skills'):
                applicant_skills = set(self.applicant.profile.skills.values_list('name', flat=True))
            
            # Get job's required skills
            job_required_skills = set(self.job.skills_required.values_list('name', flat=True))

            if not job_required_skills:
                return 100.00

            # Calculate match based on intersection
            matched_skills_count = len(applicant_skills.intersection(job_required_skills))
            total_required_skills = len(job_required_skills)
            
            score = (matched_skills_count / total_required_skills) * 100
            return round(score, 2)
        except Exception as e:
            print(f"Error calculating match score for application {self.id}: {e}")
            return 0.00

    def calculate_match_details(self):
        """
        Calculates and returns the match details dynamically.
        """
        try:
            # Get applicant's skills
            applicant_skills = set()
            if hasattr(self.applicant, 'profile') and hasattr(self.applicant.profile, 'skills'):
                applicant_skills = set(self.applicant.profile.skills.values_list('name', flat=True))
            
            # Get job's required skills
            job_required_skills = set(self.job.skills_required.values_list('name', flat=True))

            # Determine matched and missing skills
            matched_skills = list(applicant_skills.intersection(job_required_skills))
            missing_skills = list(job_required_skills.difference(applicant_skills))

            # Generate feedback
            feedback = []
            if missing_skills:
                feedback.append(f"Consider adding skills like: {', '.join(missing_skills[:3])}.")
            if len(matched_skills) >= len(job_required_skills) * 0.8:
                feedback.append("Strong match! Your skills align well with the job requirements.")
            elif len(matched_skills) >= len(job_required_skills) * 0.5:
                feedback.append("Good match, but there's room for improvement.")
            else:
                feedback.append("Your application could benefit from highlighting more relevant skills.")

            return {
                "skills_matched": matched_skills,
                "skills_missing": missing_skills,
                "feedback": feedback
            }
        except Exception as e:
            print(f"Error calculating match details for application {self.id}: {e}")
            return {
                "skills_matched": [],
                "skills_missing": [],
                "feedback": [f"Error generating match details: {str(e)}"]
            }