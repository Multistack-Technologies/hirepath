from django.contrib import admin
from .models import JobRole

@admin.register(JobRole)
class JobRoleAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'is_in_demand', 'remote_friendly', 
        'get_skills_count'
    ]
    list_filter = ['category', 'is_in_demand', 'remote_friendly', 'created_at']
    search_fields = ['title', 'description']
    filter_horizontal = ['skills']
    ordering = ['category', 'title']
    
    def get_skills_count(self, obj):
        return obj.skills.count()
    get_skills_count.short_description = 'Skills Count'

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('skills')