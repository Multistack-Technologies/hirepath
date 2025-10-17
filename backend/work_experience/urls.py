from django.urls import path
from .views import (
    WorkExperienceListCreateView,
    WorkExperienceDetailView,
    user_work_experiences,
    create_work_experience,
    work_experience_stats
)

urlpatterns = [
    path('', WorkExperienceListCreateView.as_view(), name='work-experience-list-create'),
    path('user/', user_work_experiences, name='user-work-experiences'),
    path('create/', create_work_experience, name='create-work-experience'),
    path('stats/', work_experience_stats, name='work-experience-stats'),
    path('<int:pk>/', WorkExperienceDetailView.as_view(), name='work-experience-detail'),
]