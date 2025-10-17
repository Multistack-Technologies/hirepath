# backend/resumes/urls.py
from django.urls import path
from .views import get_latest_resume_analysis, job_role_recommendations, certificate_recommendations, career_insights, upload_and_analyze_resume

urlpatterns = [
    path('analyze/', upload_and_analyze_resume, name='upload_and_analyze_resume'),
    path('analysis/', get_latest_resume_analysis, name='get_latest_resume_analysis'),
    path('recommendations/job-roles/', job_role_recommendations, name='job-role-recommendations'),
    path('recommendations/certificates/', certificate_recommendations, name='certificate-recommendations'),
    path('recommendations/insights/', career_insights, name='career-insights'),
]