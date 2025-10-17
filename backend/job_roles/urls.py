from django.urls import path
from .views import (
    JobRoleListView,
    JobRoleDetailView,
    JobRoleCreateView,
    job_role_search,
    in_demand_roles,
    job_role_categories,
    job_role_stats
)

urlpatterns = [
    path('', JobRoleListView.as_view(), name='job-role-list'),
    path('create/', JobRoleCreateView.as_view(), name='job-role-create'),
    path('search/', job_role_search, name='job-role-search'),
    path('in-demand/', in_demand_roles, name='in-demand-roles'),
    path('categories/', job_role_categories, name='job-role-categories'),
    path('stats/', job_role_stats, name='job-role-stats'),
    path('<int:pk>/', JobRoleDetailView.as_view(), name='job-role-detail'),
]