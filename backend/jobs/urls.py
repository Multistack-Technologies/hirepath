from django.urls import path
from .views import  JobDetailView, JobListCreateView, MyJobListView, ping

urlpatterns = [
    path("ping/", ping, name="jobs-ping"),
    path("", JobListCreateView.as_view(), name="job-list-create"),
    path("me/", MyJobListView.as_view(), name="my-job-list"), # Get jobs posted by me
    path("<int:pk>/", JobDetailView.as_view(), name="job-detail"),
]
