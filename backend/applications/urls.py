# backend/applications/urls.py
from django.urls import path
from .views import (
    ApplicationCreateView, 
    MyApplicationsView, 
    JobApplicationsView,
    ApplicationStatusUpdateView,
    graduate_stats,
    recruiter_stats,
    recruiter_candidates,
    withdraw_application
)

urlpatterns = [
    path("apply/", ApplicationCreateView.as_view(), name="apply-job"),
    path("mine/", MyApplicationsView.as_view(), name="my-applications"),
    path("job/<int:job_id>/", JobApplicationsView.as_view(), name="job-applications"),
    path("<int:pk>/status/", ApplicationStatusUpdateView.as_view(), name="update-application-status"),
    path("<int:application_id>/withdraw/", withdraw_application, name="withdraw-application"),
    
    # Stats endpoints
    path("graduate/stats/", graduate_stats, name="graduate-stats"),
    path("recruiter/stats/", recruiter_stats, name="recruiter-stats"),
    path("recruiter/candidates/", recruiter_candidates, name="recruiter-candidates"),
]