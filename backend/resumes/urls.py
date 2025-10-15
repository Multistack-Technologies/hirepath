from django.urls import path
from . import views

urlpatterns = [
     path('analyze/', views.upload_and_analyze_resume, name='upload_and_analyze_resume'),
     path('analysis/', views.get_latest_resume_analysis, name='get_latest_resume_analysis'),
]
