from django.urls import path
from .views import (
    EducationListCreateView,
    EducationDetailView,
    user_educations,
    create_education,
    education_stats
)

urlpatterns = [
    path('', EducationListCreateView.as_view(), name='education-list-create'),
    path('user/', user_educations, name='user-educations'),
    path('create/', create_education, name='create-education'),
    path('stats/', education_stats, name='education-stats'),
    path('<int:pk>/', EducationDetailView.as_view(), name='education-detail'),
]