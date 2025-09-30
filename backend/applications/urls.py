from django.urls import path
from .views import ApplicationCreateView, MyApplicationsView, JobApplicationsView

urlpatterns = [
    path("apply/", ApplicationCreateView.as_view(), name="apply-job"),
    path("mine/", MyApplicationsView.as_view(), name="my-applications"),
    path("job/<int:job_id>/", JobApplicationsView.as_view(), name="job-applications"),
]
