from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'company', 'location', 'employment_type', 
        'work_type', 'experience_level', 'is_active', 'created_at'
    ]
    list_filter = [
        'employment_type', 'work_type', 'experience_level', 
        'created_at', 'closing_date'
    ]
    search_fields = [
        'title', 'company__name', 'location', 'description'
    ]
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['skills_required', 'certificates_preferred', 'courses_preferred']
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'company', 'location')
        }),
        ('Job Details', {
            'fields': (
                'employment_type', 'work_type', 'experience_level',
                'min_salary', 'max_salary', 'closing_date'
            )
        }),
        ('Requirements', {
            'fields': (
                'skills_required', 'certificates_preferred', 'courses_preferred'
            )
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )

    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True
    is_active.short_description = 'Active'