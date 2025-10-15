# backend/applications/models.py
from django.db import models
from django.conf import settings
from jobs.models import Job  # Import Job model

User = settings.AUTH_USER_MODEL

class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        REVIEWED = "REVIEWED", "Reviewed"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("job", "applicant")  # prevent duplicate applications

    def __str__(self):
        return f"{self.applicant.username} → {self.job.title} ({self.status})"

    # --- Add Dynamic Match Calculation Methods ---
    
    def calculate_match_score(self):
        """
        Calculates and returns the match score dynamically.
        Replace this placeholder logic with your actual AI engine call.
        This is a simplified example based on skill matching.
        """
        try:
            # --- Placeholder AI Logic ---
            # 1. Get applicant's skills (assuming a 'skills' M2M relationship on the User/Profile model)
            # You need to adjust this based on your actual user profile model structure
            applicant_skills_qs = getattr(self.applicant, 'skills', None)
            if applicant_skills_qs is None:
                # Handle case where user profile doesn't have skills directly
                # e.g., if skills are on a separate GraduateProfile model
                # applicant_skills_qs = self.applicant.graduate_profile.skills.all() 
                # For now, assume skills are directly on User or accessed via a property
                applicant_skills = set() # Or handle error gracefully
            else:
                applicant_skills = set(applicant_skills_qs.values_list('name', flat=True))
            
            # 2. Get job's required skills (assuming a 'skills_required' M2M on the Job model)
            job_required_skills = set(self.job.skills_required.values_list('name', flat=True))

            if not job_required_skills:
                return 100.00 # Perfect match if no skills required

            # 3. Calculate match based on intersection
            matched_skills_count = len(applicant_skills.intersection(job_required_skills))
            total_required_skills = len(job_required_skills)
            
            score = (matched_skills_count / total_required_skills) * 100
            return round(score, 2)
        except Exception as e:
            print(f"Error calculating match score for application {self.id}: {e}")
            # Return a default low score or handle error as appropriate
            return 0.00 

    def calculate_match_details(self):
        """
        Calculates and returns the match details dynamically.
        Replace this placeholder logic with your actual AI engine call.
        This provides structured feedback.
        """
        try:
            # --- Placeholder AI Logic ---
            # 1. Get applicant's skills
            applicant_skills_qs = getattr(self.applicant, 'skills', None)
            if applicant_skills_qs is None:
                 applicant_skills = set()
            else:
                 applicant_skills = set(applicant_skills_qs.values_list('name', flat=True))
            
            # 2. Get job's required skills
            job_required_skills = set(self.job.skills_required.values_list('name', flat=True))

            # 3. Determine matched and missing skills
            matched_skills = list(applicant_skills.intersection(job_required_skills))
            missing_skills = list(job_required_skills.difference(applicant_skills))

            # 4. Generate simple feedback
            feedback = []
            if missing_skills:
                feedback.append(f"Consider adding skills like: {', '.join(missing_skills[:3])}.") # Show top 3
            if len(matched_skills) >= len(job_required_skills) * 0.8:
                feedback.append("Strong match! Your skills align well with the job requirements.")
            elif len(matched_skills) >= len(job_required_skills) * 0.5:
                feedback.append("Good match, but there's room for improvement.")
            else:
                feedback.append("Your application could benefit from highlighting more relevant skills.")

            # 5. Construct the details object
            details = {
                "skills_matched": matched_skills,
                "skills_missing": missing_skills,
                # Placeholder values - replace with actual checks
                "experience_relevant": True, 
                "education_relevant": True,   
                "feedback": feedback
            }
            return details
        except Exception as e:
            print(f"Error calculating match details for application {self.id}: {e}")
            # Return a default error object
            return {
                "skills_matched": [],
                "skills_missing": [],
                "experience_relevant": False,
                "education_relevant": False,
                "feedback": [f"Error generating match details: {str(e)}"]
            }
    # --- End of Dynamic Match Calculation Methods ---