from django.urls import path
from .views import JobDetailView, JobListCreateView, MyJobListView, ping, active_jobs, job_categories

urlpatterns = [
    path("ping/", ping, name="jobs-ping"),
    path("", JobListCreateView.as_view(), name="job-list-create"),
    path("active/", active_jobs, name="active-jobs"),
    path("categories/", job_categories, name="job-categories"),
    path("me/", MyJobListView.as_view(), name="my-job-list"),
    path("<int:pk>/", JobDetailView.as_view(), name="job-detail"),
]