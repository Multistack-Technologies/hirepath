# backend/skills/urls.py
from django.urls import path
from .views import (
    SkillListCreateView, 
    UserSkillsView, 
    add_skill_to_user, 
    remove_skill_from_user
)

urlpatterns = [
    path("", SkillListCreateView.as_view(), name="skill-list-create"),
    path("user-skills/", UserSkillsView.as_view(), name="user-skills"),
    path("add-to-user/", add_skill_to_user, name="add-skill-to-user"),
    path("remove-from-user/<int:skill_id>/", remove_skill_from_user, name="remove-skill-from-user"),
]