# backend/applications/urls.py
from django.urls import path
from .views import (
    ApplicationCreateView, 
    MyApplicationsView, 
    JobApplicationsView,
    graduate_stats,
    recruiter_stats,
    recruiter_candidates
)

urlpatterns = [
    path("apply/", ApplicationCreateView.as_view(), name="apply-job"),
    path("mine/", MyApplicationsView.as_view(), name="my-applications"),
    path("job/<int:job_id>/", JobApplicationsView.as_view(), name="job-applications"),
    
    # New stats endpoints
    path("graduate/stats/", graduate_stats, name="graduate-stats"),
    path("recruiter/stats/", recruiter_stats, name="recruiter-stats"),
    path("recruiter/candidates/", recruiter_candidates, name="recruiter-candidates"),
]