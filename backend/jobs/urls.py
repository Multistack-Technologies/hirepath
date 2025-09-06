from django.urls import path
from .views import  JobListCreateView, ping

urlpatterns = [
    path("ping/", ping, name="jobs-ping"),
    path("", JobListCreateView.as_view(), name="job-list-create"),
]
