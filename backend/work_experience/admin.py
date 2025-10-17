from django.contrib import admin
from .models import WorkExperience

@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'job_title', 'is_current', 'start_date', 'end_date']
    list_filter = ['is_current', 'start_date', 'created_at']
    search_fields = ['user__username', 'company_name', 'job_title']
    raw_id_fields = ['user']
    date_hierarchy = 'start_date'