from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    profile,
    update_profile,
    ping,
    update_skills,
    get_user_skills,
    set_user_skills,
    add_user_skill,
    remove_user_skill,
    delete_avatar,
    # Add these new views
    manage_target_job_roles,
    set_current_job_role,
    remove_current_job_role,
    job_role_recommendations
)

urlpatterns = [
    # Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    
    # Profile
    path('profile/', profile, name='profile'),
    path('profile/update/', update_profile, name='update-profile'),
    path('profile/avatar/delete/', delete_avatar, name='delete-avatar'),
    
    # Skills Management
    path('skills/', get_user_skills, name='get-user-skills'),
    path('skills/set/', set_user_skills, name='set-user-skills'),
    path('skills/update/', update_skills, name='update-skills'),
    path('skills/add/', add_user_skill, name='add-user-skill'),
    path('skills/remove/<int:skill_id>/', remove_user_skill, name='remove-user-skill'),
    
    # Job Role Management
    path('job-roles/target/', manage_target_job_roles, name='manage-target-job-roles'),
    path('job-roles/current/', set_current_job_role, name='set-current-job-role'),
    path('job-roles/current/remove/', remove_current_job_role, name='remove-current-job-role'),
    path('job-roles/recommendations/', job_role_recommendations, name='job-role-recommendations'),
    
    # Testing
    path('ping/', ping, name='ping'),
]