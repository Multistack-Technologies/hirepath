# analytics/admin.py
from django.contrib import admin
from .models import RecruitmentReport, DashboardView, AnalyticsExport

@admin.register(RecruitmentReport)
class RecruitmentReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'recruiter', 'report_type', 'generated_at']
    list_filter = ['report_type', 'generated_at']
    search_fields = ['title', 'recruiter__username']
    readonly_fields = ['generated_at', 'last_accessed']

@admin.register(DashboardView)
class DashboardViewAdmin(admin.ModelAdmin):
    list_display = ['name', 'recruiter', 'is_default', 'created_at']
    list_filter = ['is_default', 'created_at']
    search_fields = ['name', 'recruiter__username']

@admin.register(AnalyticsExport)
class AnalyticsExportAdmin(admin.ModelAdmin):
    list_display = ['export_type', 'recruiter', 'format', 'status', 'created_at']
    list_filter = ['export_type', 'format', 'status', 'created_at']
    search_fields = ['recruiter__username']