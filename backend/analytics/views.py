# analytics/views.py
# analytics/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta, datetime
import pandas as pd
import json
from io import BytesIO

from .models import RecruitmentReport, DashboardView, AnalyticsExport
from .serializers import (
    RecruitmentReportSerializer, DashboardViewSerializer, AnalyticsExportSerializer,
    ReportGenerateSerializer, ExportRequestSerializer
)
from .analytics_engine import RecruitmentAnalyticsEngine
from applications.models import Application

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recruiter_dashboard(request):
    """Get recruiter dashboard overview - FIXED VERSION"""
    try:
        # Get days parameter with default
        days_param = request.GET.get('days', '30')
        try:
            days = int(days_param)
        except ValueError:
            days = 30
        
        # Validate days range
        if days <= 0 or days > 365:
            days = 30
        
        # Initialize analytics engine
        engine = RecruitmentAnalyticsEngine(request.user)
        
        # Get dashboard data
        overview_data = engine.get_recruiter_overview(days)
        
        return Response({
            'success': True,
            'data': overview_data,
            'period_days': days
        })
        
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to load dashboard data',
            'debug_error': str(e)  # Remove in production
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ... rest of the views.py file remains the same as previous fix ...
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_report(request):
    """Generate a new recruitment report"""
    serializer = ReportGenerateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            engine = RecruitmentAnalyticsEngine(request.user)
            report_data = engine.generate_comprehensive_report(
                report_type=serializer.validated_data['report_type'],
                date_range_start=serializer.validated_data['date_range_start'],
                date_range_end=serializer.validated_data['date_range_end'],
                filters=serializer.validated_data.get('filters', {})
            )
            
            # Check if report generation failed
            if 'error' in report_data:
                return Response({
                    'success': False,
                    'error': report_data['error']
                }, status=status.HTTP_400_BAD_REQUEST)
            
            report = RecruitmentReport.objects.create(
                recruiter=request.user,
                title=serializer.validated_data['title'],
                report_type=serializer.validated_data['report_type'],
                description=serializer.validated_data.get('description', ''),
                date_range_start=serializer.validated_data['date_range_start'],
                date_range_end=serializer.validated_data['date_range_end'],
                filters_applied=serializer.validated_data.get('filters', {}),
                report_data=report_data
            )
            
            return Response({
                'success': True,
                'report_id': report.id,
                'message': 'Report generated successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_report_analytics(request, report_type):
    """Get analytics data for specific report type"""
    try:
        # Fix: Parse dates properly
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = (timezone.now() - timedelta(days=30)).date()
            
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = timezone.now().date()
        
        engine = RecruitmentAnalyticsEngine(request.user)
        
        # Fix: Map URL parameters to actual method names
        if report_type == 'applications':
            data = engine.get_applications_analysis(start_date, end_date)
        elif report_type == 'pipeline':
            data = engine.get_candidate_pipeline(start_date, end_date)
        elif report_type == 'sources':
            data = engine.get_source_analysis(start_date, end_date)
        elif report_type == 'skill-gaps':
            data = engine.get_skill_gap_analysis(start_date, end_date)
        elif report_type == 'time-to-hire':
            data = engine.get_time_to_hire_analysis(start_date, end_date)
        else:
            return Response({
                'success': False,
                'error': 'Invalid report type'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': data,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_export(request):
    """Request data export"""
    serializer = ExportRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            export = AnalyticsExport.objects.create(
                recruiter=request.user,
                export_type=serializer.validated_data['export_type'],
                format=serializer.validated_data['format'],
                filters=serializer.validated_data.get('filters', {})
            )
            
            # Process export immediately (in production, use Celery)
            process_export(export)
            
            return Response({
                'success': True,
                'export_id': export.id,
                'message': 'Export request submitted'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

def process_export(export):
    """Process export request"""
    try:
        from applications.models import Application
        from django.core.files.base import ContentFile
        
        if export.export_type == 'APPLICATIONS':
            # Get applications data
            applications = Application.objects.filter(
                job__created_by=export.recruiter
            ).select_related('applicant', 'job', 'job__company')
            
            application_data = []
            for app in applications:
                application_data.append({
                    'Applicant Name': app.applicant.get_full_name(),
                    'Applicant Email': app.applicant.email,
                    'Job Title': app.job.title,
                    'Company': app.job.company.name,
                    'Status': app.status,
                    'Match Score': app.match_score or 0,
                    'Applied Date': app.applied_at.strftime('%Y-%m-%d'),
                    'Cover Letter': app.cover_letter or ''
                })
            
            file_content = generate_excel_export(application_data, 'Applications')
            
        elif export.export_type == 'CANDIDATES':
            # Export candidate data
            applications = Application.objects.filter(
                job__created_by=export.recruiter
            ).select_related('applicant', 'job')
            
            candidate_data = []
            for app in applications:
                candidate_data.append({
                    'Name': app.applicant.get_full_name(),
                    'Email': app.applicant.email,
                    'Job Title': app.job.title,
                    'Status': app.status,
                    'Match Score': app.match_score or 0,
                    'Applied Date': app.applied_at.date().isoformat(),
                })
            
            file_content = generate_excel_export(candidate_data, 'Candidates')
        else:
            # Default empty export
            file_content = generate_excel_export([], 'Export')
        
        # Save file
        filename = f"{export.export_type}_{export.recruiter.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        export.file.save(filename, ContentFile(file_content))
        export.status = 'COMPLETED'
        export.completed_at = timezone.now()
        export.save()
        
    except Exception as e:
        print(f"Export processing error: {e}")
        export.status = 'FAILED'
        export.save()

def generate_excel_export(data, sheet_name):
    """Generate Excel file from data"""
    try:
        if not data:
            # Create empty DataFrame with columns if no data
            df = pd.DataFrame(columns=['No Data Available'])
        else:
            df = pd.DataFrame(data)
        
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name=sheet_name, index=False)
        return output.getvalue()
    except Exception as e:
        print(f"Excel generation error: {e}")
        # Return empty Excel file
        output = BytesIO()
        df = pd.DataFrame(columns=['Error generating export'])
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Error', index=False)
        return output.getvalue()

class ReportListView(generics.ListCreateAPIView):
    """List and create recruiter's reports"""
    serializer_class = RecruitmentReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return RecruitmentReport.objects.filter(recruiter=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)

class ReportDetailView(generics.RetrieveDestroyAPIView):
    """Get specific report details"""
    serializer_class = RecruitmentReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return RecruitmentReport.objects.filter(recruiter=self.request.user)

class DashboardViewListCreate(generics.ListCreateAPIView):
    """Manage recruiter dashboard views"""
    serializer_class = DashboardViewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return DashboardView.objects.filter(recruiter=self.request.user)
    
    def perform_create(self, serializer):
        # Ensure only one default dashboard per user
        if serializer.validated_data.get('is_default', False):
            DashboardView.objects.filter(recruiter=self.request.user, is_default=True).update(is_default=False)
        serializer.save(recruiter=self.request.user)

class ExportListView(generics.ListAPIView):
    """List recruiter's exports"""
    serializer_class = AnalyticsExportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AnalyticsExport.objects.filter(recruiter=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_export(request, export_id):
    """Download export file"""
    try:
        export = AnalyticsExport.objects.get(id=export_id, recruiter=request.user)
        
        if export.status != 'COMPLETED' or not export.file:
            return Response({
                'success': False,
                'error': 'Export not ready or file missing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        response = HttpResponse(export.file.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export.file.name}"'
        return response
        
    except AnalyticsExport.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Export not found'
        }, status=status.HTTP_404_NOT_FOUND)