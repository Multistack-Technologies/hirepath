from django.contrib import admin
from .models import Education

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['user', 'degree', 'university', 'start_date', 'end_date', 'is_current']
    list_filter = ['is_current', 'start_date', 'created_at']
    search_fields = ['user__username', 'degree__name', 'university__name']
    raw_id_fields = ['user', 'university', 'degree']
    date_hierarchy = 'start_date'