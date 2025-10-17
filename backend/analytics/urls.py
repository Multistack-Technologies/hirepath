# analytics/urls.py
from django.urls import path
from .views import (
    recruiter_dashboard,
    generate_report,
    get_report_analytics,
    request_export,
    ReportListView,
    ReportDetailView,
    DashboardViewListCreate,
    ExportListView,
    download_export
)

urlpatterns = [
    # Dashboard
    path('dashboard/', recruiter_dashboard, name='recruiter-dashboard'),
    
    # Reports
    path('reports/', ReportListView.as_view(), name='report-list'),
    path('reports/generate/', generate_report, name='generate-report'),
    path('reports/<int:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('analytics/<str:report_type>/', get_report_analytics, name='get-analytics'),
    
    # Dashboards
    path('dashboards/', DashboardViewListCreate.as_view(), name='dashboard-views'),
    
    # Exports
    path('exports/', ExportListView.as_view(), name='export-list'),
    path('exports/request/', request_export, name='request-export'),
    path('exports/<int:export_id>/download/', download_export, name='download-export'),
]