# backend/applications/models.py
from django.db import models
from django.conf import settings
from jobs.models import Job
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        REVIEWED = "REVIEWED", "Reviewed"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"
        INTERVIEW = "INTERVIEW", "Interview"  # Added interview stage
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"  # Added withdrawn status

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    match_score = models.FloatField(null=True, blank=True)
    
    # Additional fields for better tracking
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
            self.match_score = self.calculate_match_score()
        super().save(*args, **kwargs)

    def calculate_match_score(self):
        """
        Enhanced match score calculation considering skills, education, and experience
        """
        try:
            total_score = 0
            criteria_count = 0
            
            # 1. Skills Match (40% weight)
            applicant_skills = set(self.applicant.skills.values_list('name', flat=True))
            job_required_skills = set(self.job.skills_required.values_list('name', flat=True))
            
            if job_required_skills:
                skills_match = len(applicant_skills.intersection(job_required_skills)) / len(job_required_skills)
                total_score += skills_match * 40
                criteria_count += 1
            
            # 2. Education Match (30% weight)
            applicant_educations = self.applicant.educations.all()
            preferred_courses = self.job.courses_preferred.all()
            
            if preferred_courses.exists():
                education_match = self.calculate_education_match(applicant_educations, preferred_courses)
                total_score += education_match * 30
                criteria_count += 1
            
            # 3. Certificates Match (20% weight)
            applicant_certificates = self.applicant.certificates.all()
            preferred_certificates = self.job.certificates_preferred.all()
            
            if preferred_certificates.exists():
                cert_match = self.calculate_certificate_match(applicant_certificates, preferred_certificates)
                total_score += cert_match * 20
                criteria_count += 1
            
            # 4. Experience Level (10% weight)
            experience_match = self.calculate_experience_match()
            total_score += experience_match * 10
            criteria_count += 1
            
            # Normalize score if not all criteria were applicable
            if criteria_count > 0:
                final_score = total_score / criteria_count
                return round(final_score, 2)
            
            return 0.00
            
        except Exception as e:
            print(f"Error calculating match score for application {self.id}: {e}")
            return 0.00

    def calculate_education_match(self, applicant_educations, preferred_courses):
        """Calculate education match based on degrees and fields of study"""
        if not applicant_educations.exists():
            return 0
        
        applicant_degrees = set(edu.degree.name for edu in applicant_educations if edu.degree)
        preferred_degree_names = set(course.name for course in preferred_courses)
        
        if not preferred_degree_names:
            return 0
            
        match_count = len(applicant_degrees.intersection(preferred_degree_names))
        return match_count / len(preferred_degree_names)

    def calculate_certificate_match(self, applicant_certs, preferred_certs):
        """Calculate certificate match"""
        if not applicant_certs.exists():
            return 0
            
        applicant_cert_names = set(cert.provider.name for cert in applicant_certs if cert.provider)
        preferred_cert_names = set(cert.name for cert in preferred_certs)
        
        if not preferred_cert_names:
            return 0
            
        match_count = len(applicant_cert_names.intersection(preferred_cert_names))
        return match_count / len(preferred_cert_names)

    def calculate_experience_match(self):
        """Calculate experience level match"""
        try:
            experience_mapping = {
                'ENTRY': 1,
                'MID': 2, 
                'SENIOR': 3,
                'LEAD': 4
            }
            
            job_experience = experience_mapping.get(self.job.experience_level, 1)
            
            # Simple experience calculation based on work experience duration
            user_experience = self.applicant.work_experiences.aggregate(
                total_months=models.Sum('duration_months')
            )['total_months'] or 0
            
            user_experience_years = user_experience / 12
            
            # Map years to experience levels
            if user_experience_years >= 5:
                user_level = 3  # Senior
            elif user_experience_years >= 2:
                user_level = 2  # Mid
            else:
                user_level = 1  # Entry
                
            return min(user_level / job_experience, 1.0)
        except Exception:
            return 0.0

    def calculate_match_details(self):
        """Enhanced match details with comprehensive analysis"""
        try:
            details = {
                "skills_matched": [],
                "skills_missing": [],
                "education_match": {},
                "certificate_match": {},
                "experience_match": {},
                "feedback": []
            }
            
            # Skills analysis
            applicant_skills = set(self.applicant.skills.values_list('name', flat=True))
            job_required_skills = set(self.job.skills_required.values_list('name', flat=True))
            
            details["skills_matched"] = list(applicant_skills.intersection(job_required_skills))
            details["skills_missing"] = list(job_required_skills.difference(applicant_skills))
            
            # Education analysis
            applicant_educations = self.applicant.educations.all()
            preferred_courses = self.job.courses_preferred.all()
            
            if preferred_courses.exists():
                details["education_match"] = {
                    "has_required_education": any(
                        edu.degree in preferred_courses for edu in applicant_educations if edu.degree
                    ),
                    "preferred_courses": [course.name for course in preferred_courses]
                }
            
            # Certificate analysis
            applicant_certificates = self.applicant.certificates.all()
            preferred_certificates = self.job.certificates_preferred.all()
            
            if preferred_certificates.exists():
                matched_certs = [
                    cert for cert in applicant_certificates 
                    if cert.provider and cert.provider in preferred_certificates
                ]
                details["certificate_match"] = {
                    "matched_certificates": [cert.provider.name for cert in matched_certs if cert.provider],
                    "missing_certificates": [cert.name for cert in preferred_certificates]
                }
            
            # Generate feedback
            self.generate_feedback(details)
            
            return details
            
        except Exception as e:
            print(f"Error calculating match details for application {self.id}: {e}")
            return {
                "skills_matched": [],
                "skills_missing": [],
                "education_match": {},
                "certificate_match": {},
                "experience_match": {},
                "feedback": [f"Error generating match details: {str(e)}"]
            }

    def generate_feedback(self, details):
        """Generate actionable feedback based on match analysis"""
        feedback = []
        
        # Skills feedback
        total_skills = len(details["skills_matched"]) + len(details["skills_missing"])
        if total_skills > 0:
            skills_match_ratio = len(details["skills_matched"]) / total_skills
            
            if skills_match_ratio >= 0.8:
                feedback.append("🎯 Excellent skills match! Your technical skills align perfectly with the job requirements.")
            elif skills_match_ratio >= 0.6:
                feedback.append("✅ Good skills alignment. Consider highlighting your experience with the matched skills.")
            else:
                feedback.append("💡 Consider developing skills in: " + ", ".join(details["skills_missing"][:3]))
        
        # Education feedback
        if details["education_match"].get("has_required_education"):
            feedback.append("📚 Your educational background matches the preferred qualifications.")
        elif details["education_match"].get("preferred_courses"):
            feedback.append("🎓 While you have strong education, the role prefers: " + ", ".join(details["education_match"]["preferred_courses"][:2]))
        
        # Certificate feedback
        if details["certificate_match"].get("matched_certificates"):
            feedback.append("🏆 Great job on obtaining relevant certifications!")
        elif details["certificate_match"].get("missing_certificates"):
            feedback.append("📜 Consider pursuing certifications in: " + ", ".join(details["certificate_match"]["missing_certificates"][:2]))
        
        details["feedback"] = feedback