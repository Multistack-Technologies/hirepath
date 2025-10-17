# analytics/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
import pandas as pd
import json

from .models import RecruitmentReport, DashboardView, AnalyticsExport
from .serializers import (
    RecruitmentReportSerializer, DashboardViewSerializer, AnalyticsExportSerializer,
    ReportGenerateSerializer, ExportRequestSerializer
)
from .analytics_engine import RecruitmentAnalyticsEngine

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recruiter_dashboard(request):
    """Get recruiter dashboard overview"""
    try:
        days = int(request.GET.get('days', 30))
        engine = RecruitmentAnalyticsEngine(request.user)
        overview = engine.get_recruiter_overview(days)
        
        return Response({
            'success': True,
            'data': overview
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

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
            }, status=500)
    
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_report_analytics(request, report_type):
    """Get analytics data for specific report type"""
    try:
        start_date = request.GET.get('start_date', (timezone.now() - timedelta(days=30)).date())
        end_date = request.GET.get('end_date', timezone.now().date())
        
        engine = RecruitmentAnalyticsEngine(request.user)
        
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
            return Response({'error': 'Invalid report type'}, status=400)
        
        return Response({
            'success': True,
            'data': data,
            'date_range': f"{start_date} to {end_date}"
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

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
            
            # Process export (in production, use Celery)
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
            }, status=500)
    
    return Response(serializer.errors, status=400)

def process_export(export):
    """Process export request"""
    try:
        engine = RecruitmentAnalyticsEngine(export.recruiter)
        
        if export.export_type == 'APPLICATIONS':
            data = engine.get_applications_analysis(
                export.filters.get('start_date', (timezone.now() - timedelta(days=30)).date()),
                export.filters.get('end_date', timezone.now().date()),
                export.filters
            )
            file_content = generate_excel_export(data, 'Applications')
        
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
                    'Match Score': app.match_score,
                    'Applied Date': app.applied_at.date(),
                    'Source': app.application_source
                })
            
            file_content = generate_excel_export(candidate_data, 'Candidates')
        
        # Save file
        from django.core.files.base import ContentFile
        filename = f"{export.export_type}_{export.recruiter.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        export.file.save(filename, ContentFile(file_content))
        export.status = 'COMPLETED'
        export.completed_at = timezone.now()
        export.save()
        
    except Exception as e:
        export.status = 'FAILED'
        export.save()

def generate_excel_export(data, sheet_name):
    """Generate Excel file from data"""
    df = pd.DataFrame(data)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=sheet_name, index=False)
    return output.getvalue()

class ReportListView(generics.ListAPIView):
    """List recruiter's reports"""
    serializer_class = RecruitmentReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return RecruitmentReport.objects.filter(recruiter=self.request.user)

class ReportDetailView(generics.RetrieveAPIView):
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
        
        if export.status != 'COMPLETED':
            return Response({'error': 'Export not ready'}, status=400)
        
        response = HttpResponse(export.file.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export.file.name}"'
        return response
        
    except AnalyticsExport.DoesNotExist:
        return Response({'error': 'Export not found'}, status=404)