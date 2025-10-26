from django.urls import path
from .views import upload_and_analyze_resume, get_latest_resume, get_job_role_recommendations

urlpatterns = [
    path("upload/", upload_and_analyze_resume, name="upload_and_analyze_resume"),
    path("latest/", get_latest_resume, name="get_latest_resume"),
    path("recommendations/<int:resume_id>/", get_job_role_recommendations, name="get_job_role_recommendations"),
]