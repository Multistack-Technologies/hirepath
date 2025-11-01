# analytics/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta, datetime
import pandas as pd
import json
import csv
from io import BytesIO, StringIO
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

from .models import RecruitmentReport, DashboardView, AnalyticsExport
from .serializers import (
    RecruitmentReportSerializer, DashboardViewSerializer, AnalyticsExportSerializer,
    ReportGenerateSerializer, ExportRequestSerializer
)
from .analytics_engine import RecruitmentAnalyticsEngine
from applications.models import Application
from jobs.models import Job
from django.db import models
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recruiter_dashboard(request):
    """Get recruiter dashboard overview"""
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
            'debug_error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                report_data=report_data,
                is_exported=False,
                export_format=None
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

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def export_report(request, report_id):
    """Export a specific report to different formats"""
    try:
        report = RecruitmentReport.objects.get(id=report_id, recruiter=request.user)
        
        # Get export format from request
        export_format = request.data.get('format', 'PDF')
        if export_format not in dict(RecruitmentReport.EXPORT_FORMATS):
            return Response({
                'success': False,
                'error': 'Invalid export format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate the export file
        file_content = generate_report_export(report, export_format)
        
        # Save the exported file
        filename = f"report_{report.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{export_format.lower()}"
        report.exported_file.save(filename, ContentFile(file_content))
        report.export_format = export_format
        report.is_exported = True
        report.save()
        
        return Response({
            'success': True,
            'message': f'Report exported successfully as {export_format}',
            'file_url': request.build_absolute_uri(report.exported_file.url) if report.exported_file else None
        })
        
    except RecruitmentReport.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Report not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def generate_report_export(report, format):
    """Generate export file for a report"""
    if format == 'PDF':
        return generate_report_pdf(report)
    elif format == 'EXCEL':
        return generate_report_excel(report)
    elif format == 'CSV':
        return generate_report_csv(report)
    elif format == 'JSON':
        return generate_report_json(report)
    else:
        return generate_report_pdf(report)

def generate_report_pdf(report):
    """Generate PDF export for a report"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
    )
    story.append(Paragraph(report.title, title_style))
    
    # Report info
    info_data = [
        ['Report Type:', report.get_report_type_display()],
        ['Date Range:', f"{report.date_range_start} to {report.date_range_end}"],
        ['Generated:', report.generated_at.strftime('%Y-%m-%d %H:%M')],
    ]
    
    if report.description:
        info_data.append(['Description:', report.description])
    
    info_table = Table(info_data, colWidths=[100, 300])
    info_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # Report data sections
    if report.report_data:
        for section_name, section_data in report.report_data.items():
            if section_data:
                story.append(Paragraph(section_name.replace('_', ' ').title(), styles['Heading2']))
                
                if isinstance(section_data, dict):
                    table_data = [['Metric', 'Value']]
                    for key, value in section_data.items():
                        if isinstance(value, (dict, list)):
                            table_data.append([key, json.dumps(value, indent=2)])
                        else:
                            table_data.append([key, str(value)])
                    
                    if len(table_data) > 1:
                        section_table = Table(table_data, colWidths=[150, 250])
                        section_table.setStyle(TableStyle([
                            ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
                            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
                            ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ]))
                        story.append(section_table)
                        story.append(Spacer(1, 10))
                
                elif isinstance(section_data, list) and section_data:
                    if all(isinstance(item, dict) for item in section_data):
                        headers = list(section_data[0].keys())
                        table_data = [headers]
                        for item in section_data[:10]:
                            table_data.append([str(item.get(h, '')) for h in headers])
                        
                        section_table = Table(table_data, colWidths=[400/len(headers)] * len(headers))
                        section_table.setStyle(TableStyle([
                            ('FONT', (0, 0), (-1, -1), 'Helvetica', 8),
                            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
                            ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ]))
                        story.append(section_table)
                        story.append(Spacer(1, 10))
    
    doc.build(story)
    return buffer.getvalue()

def generate_report_excel(report):
    """Generate Excel export for a report"""
    output = BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # Report info sheet
        info_data = {
            'Field': ['Title', 'Report Type', 'Date Range', 'Generated', 'Description'],
            'Value': [
                report.title,
                report.get_report_type_display(),
                f"{report.date_range_start} to {report.date_range_end}",
                report.generated_at.strftime('%Y-%m-%d %H:%M'),
                report.description or ''
            ]
        }
        pd.DataFrame(info_data).to_excel(writer, sheet_name='Report Info', index=False)
        
        # Report data sheets
        if report.report_data:
            for section_name, section_data in report.report_data.items():
                if section_data:
                    sheet_name = section_name.replace('_', ' ').title()[:31]
                    if isinstance(section_data, dict):
                        df = pd.DataFrame(list(section_data.items()), columns=['Metric', 'Value'])
                    elif isinstance(section_data, list):
                        df = pd.DataFrame(section_data)
                    else:
                        df = pd.DataFrame({'Data': [str(section_data)]})
                    
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
    
    return output.getvalue()

def generate_report_csv(report):
    """Generate CSV export for a report"""
    output = StringIO()
    writer = csv.writer(output)
    
    # Report info
    writer.writerow(['Report Information'])
    writer.writerow(['Title', report.title])
    writer.writerow(['Report Type', report.get_report_type_display()])
    writer.writerow(['Date Range', f"{report.date_range_start} to {report.date_range_end}"])
    writer.writerow(['Generated', report.generated_at.strftime('%Y-%m-%d %H:%M')])
    writer.writerow(['Description', report.description or ''])
    writer.writerow([])
    
    # Report data
    if report.report_data:
        writer.writerow(['Report Data'])
        for section_name, section_data in report.report_data.items():
            writer.writerow([f"=== {section_name.replace('_', ' ').title()} ==="])
            if isinstance(section_data, dict):
                for key, value in section_data.items():
                    writer.writerow([key, str(value)])
            elif isinstance(section_data, list):
                if section_data and isinstance(section_data[0], dict):
                    headers = list(section_data[0].keys())
                    writer.writerow(headers)
                    for item in section_data:
                        writer.writerow([str(item.get(h, '')) for h in headers])
                else:
                    for item in section_data:
                        writer.writerow([str(item)])
            writer.writerow([])
    
    return output.getvalue().encode('utf-8')

def generate_report_json(report):
    """Generate JSON export for a report"""
    export_data = {
        'report_info': {
            'title': report.title,
            'report_type': report.report_type,
            'report_type_display': report.get_report_type_display(),
            'date_range_start': report.date_range_start.isoformat(),
            'date_range_end': report.date_range_end.isoformat(),
            'generated_at': report.generated_at.isoformat(),
            'description': report.description,
            'filters_applied': report.filters_applied
        },
        'report_data': report.report_data
    }
    return json.dumps(export_data, indent=2, ensure_ascii=False).encode('utf-8')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_report_analytics(request, report_type):
    """Get analytics data for specific report type"""
    try:
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

def get_applications_data(recruiter):
    """Get applications data for export"""
    applications = Application.objects.filter(
        job__created_by=recruiter
    ).select_related('applicant', 'job', 'job__company')
    
    application_data = []
    for app in applications:
        application_data.append({
            'Applicant Name': app.applicant.get_full_name(),
            'Applicant Email': app.applicant.email,
            'Job Title': app.job.title,
            'Company': app.job.company.name if app.job.company else 'N/A',
            'Status': app.status,
            'Match Score': app.match_score or 0,
            'Applied Date': app.applied_at.strftime('%Y-%m-%d'),
            'Last Updated': app.updated_at.strftime('%Y-%m-%d %H:%M'),
            'Cover Letter Preview': (app.cover_letter or '')[:100] + '...' if app.cover_letter else ''
        })
    return application_data

def get_candidates_data(recruiter):
    """Get unique candidates data"""
    candidates = Application.objects.filter(
        job__created_by=recruiter
    ).values(
        'applicant__id',
        'applicant__first_name',
        'applicant__last_name',
        'applicant__email'
    ).annotate(
        total_applications=Count('id'),
        last_application=Max('applied_at'),
        highest_match_score=Max('match_score')
    )
    
    candidate_data = []
    for candidate in candidates:
        candidate_data.append({
            'Candidate ID': candidate['applicant__id'],
            'First Name': candidate['applicant__first_name'],
            'Last Name': candidate['applicant__last_name'],
            'Email': candidate['applicant__email'],
            'Total Applications': candidate['total_applications'],
            'Last Application': candidate['last_application'].strftime('%Y-%m-%d') if candidate['last_application'] else 'N/A',
            'Highest Match Score': candidate['highest_match_score'] or 0
        })
    return candidate_data

def get_jobs_data(recruiter):
    """Get jobs data for export"""
    jobs = Job.objects.filter(
        created_by=recruiter
    ).annotate(
        application_count=Count('applications'),
        avg_match_score=Avg('applications__match_score'),
        hired_count=Count('applications', filter=models.Q(applications__status='ACCEPTED'))
    ).select_related('company')
    
    job_data = []
    for job in jobs:
        job_data.append({
            'Job Title': job.title,
            'Company': job.company.name if job.company else 'N/A',
            'Status': job.status,
            'Created Date': job.created_at.strftime('%Y-%m-%d'),
            'Closing Date': job.closing_date.strftime('%Y-%m-%d') if job.closing_date else 'Open',
            'Total Applications': job.application_count,
            'Hired Candidates': job.hired_count,
            'Average Match Score': round(job.avg_match_score or 0, 2),
            'Conversion Rate': f"{round((job.hired_count / job.application_count * 100) if job.application_count > 0 else 0, 2)}%"
        })
    return job_data

def get_analytics_data(recruiter):
    """Get analytics data for export"""
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)
    
    engine = RecruitmentAnalyticsEngine(recruiter)
    overview = engine.get_recruiter_overview(30)
    applications_analysis = engine.get_applications_analysis(start_date, end_date)
    
    analytics_data = [{
        'Metric': 'Total Jobs',
        'Value': overview.get('total_jobs', 0),
        'Category': 'Overview'
    }, {
        'Metric': 'Active Jobs',
        'Value': overview.get('active_jobs', 0),
        'Category': 'Overview'
    }, {
        'Metric': 'Total Applications (30 days)',
        'Value': overview.get('total_applications', 0),
        'Category': 'Overview'
    }, {
        'Metric': 'Conversion Rate',
        'Value': f"{overview.get('conversion_rate', 0)}%",
        'Category': 'Overview'
    }, {
        'Metric': 'Average Match Score',
        'Value': f"{overview.get('average_match_score', 0)}%",
        'Category': 'Overview'
    }, {
        'Metric': 'Applications Today',
        'Value': overview.get('quick_stats', {}).get('applications_today', 0),
        'Category': 'Quick Stats'
    }, {
        'Metric': 'Pending Review',
        'Value': overview.get('quick_stats', {}).get('pending_review', 0),
        'Category': 'Quick Stats'
    }, {
        'Metric': 'Interviews Scheduled',
        'Value': overview.get('quick_stats', {}).get('interviews_scheduled', 0),
        'Category': 'Quick Stats'
    }, {
        'Metric': 'New Hires',
        'Value': overview.get('quick_stats', {}).get('new_hires', 0),
        'Category': 'Quick Stats'
    }, {
        'Metric': 'High Quality Applications',
        'Value': applications_analysis.get('quality_metrics', {}).get('high_quality', 0),
        'Category': 'Quality Metrics'
    }, {
        'Metric': 'Medium Quality Applications',
        'Value': applications_analysis.get('quality_metrics', {}).get('medium_quality', 0),
        'Category': 'Quality Metrics'
    }, {
        'Metric': 'Low Quality Applications',
        'Value': applications_analysis.get('quality_metrics', {}).get('low_quality', 0),
        'Category': 'Quality Metrics'
    }]
    
    return analytics_data

def generate_csv_export(data, sheet_name):
    """Generate CSV file from data"""
    if not data:
        return "No data available".encode('utf-8')
    
    output = StringIO()
    
    if isinstance(data, list) and data:
        if isinstance(data[0], dict):
            headers = list(data[0].keys())
            writer = csv.DictWriter(output, fieldnames=headers)
            writer.writeheader()
            for item in data:
                row = {}
                for header in headers:
                    value = item.get(header, '')
                    if isinstance(value, (list, dict)):
                        value = json.dumps(value)
                    row[header] = str(value)
                writer.writerow(row)
        else:
            writer = csv.writer(output)
            writer.writerow(['Data'])
            for item in data:
                writer.writerow([str(item)])
    elif isinstance(data, dict):
        writer = csv.writer(output)
        writer.writerow(['Key', 'Value'])
        for key, value in data.items():
            if isinstance(value, (list, dict)):
                value = json.dumps(value)
            writer.writerow([key, str(value)])
    else:
        writer = csv.writer(output)
        writer.writerow(['Data'])
        writer.writerow([str(data)])
    
    return output.getvalue().encode('utf-8')

def generate_json_export(data):
    """Generate JSON file from data"""
    def json_serializable(obj):
        if isinstance(obj, (datetime, timezone.datetime)):
            return obj.isoformat()
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        else:
            return str(obj)
    
    return json.dumps(data, indent=2, default=json_serializable, ensure_ascii=False).encode('utf-8')

def generate_pdf_export(data, title):
    """Generate PDF export for data"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    story.append(Paragraph(f"{title} Export", styles['Heading1']))
    story.append(Paragraph(f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    if not data:
        story.append(Paragraph("No data available for export.", styles['Normal']))
    else:
        if isinstance(data, list) and data and isinstance(data[0], dict):
            headers = list(data[0].keys())
            table_data = [headers]
            
            for item in data:
                row = []
                for header in headers:
                    value = item.get(header, '')
                    if isinstance(value, str) and len(value) > 50:
                        value = value[:47] + '...'
                    row.append(str(value))
                table_data.append(row)
            
            table = Table(table_data, repeatRows=1)
            table.setStyle(TableStyle([
                ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
                ('FONT', (0, 1), (-1, -1), 'Helvetica', 8),
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(table)
            
        elif isinstance(data, list):
            for i, item in enumerate(data, 1):
                story.append(Paragraph(f"{i}. {str(item)}", styles['Normal']))
                story.append(Spacer(1, 5))
                
        elif isinstance(data, dict):
            for key, value in data.items():
                story.append(Paragraph(f"<b>{key}:</b> {str(value)}", styles['Normal']))
                story.append(Spacer(1, 5))
        else:
            story.append(Paragraph(str(data), styles['Normal']))
    
    doc.build(story)
    return buffer.getvalue()

def generate_excel_export(data, sheet_name):
    """Generate Excel file from data"""
    try:
        if not data:
            df = pd.DataFrame({'Message': ['No data available for export']})
        else:
            df = pd.DataFrame(data)
        
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            worksheet = writer.sheets[sheet_name]
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                worksheet.column_dimensions[column_letter].width = adjusted_width
                
        return output.getvalue()
    except Exception as e:
        print(f"Excel generation error: {e}")
        output = BytesIO()
        df = pd.DataFrame({'Error': [f'Failed to generate export: {str(e)}']})
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Error', index=False)
        return output.getvalue()

def process_export(export):
    """Process export request - FIXED VERSION"""
    try:
        if export.export_type == 'APPLICATIONS':
            data = get_applications_data(export.recruiter)
            sheet_name = 'Applications'
            filename_prefix = 'applications'
            
        elif export.export_type == 'CANDIDATES':
            data = get_candidates_data(export.recruiter)
            sheet_name = 'Candidates'
            filename_prefix = 'candidates'
            
        elif export.export_type == 'JOBS':
            data = get_jobs_data(export.recruiter)
            sheet_name = 'Jobs'
            filename_prefix = 'jobs'
            
        elif export.export_type == 'ANALYTICS':
            data = get_analytics_data(export.recruiter)
            sheet_name = 'Analytics'
            filename_prefix = 'analytics'
            
        else:
            data = []
            sheet_name = 'Export'
            filename_prefix = 'export'
        
        # Generate file based on format
        if export.format == 'EXCEL':
            file_content = generate_excel_export(data, sheet_name)
            file_extension = 'xlsx'
            
        elif export.format == 'CSV':
            file_content = generate_csv_export(data, sheet_name)
            file_extension = 'csv'
            
        elif export.format == 'JSON':
            file_content = generate_json_export(data)
            file_extension = 'json'
            
        elif export.format == 'PDF':
            file_content = generate_pdf_export(data, sheet_name)
            file_extension = 'pdf'
            
        else:
            file_content = generate_excel_export(data, sheet_name)
            file_extension = 'xlsx'
        
        filename = f"{filename_prefix}_{export.recruiter.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        export.file.save(filename, ContentFile(file_content))
        export.status = 'COMPLETED'
        export.completed_at = timezone.now()
        export.save()
        
    except Exception as e:
        print(f"Export processing error: {e}")
        export.status = 'FAILED'
        export.save()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_exports(request):
    """Debug view to check export status"""
    exports = AnalyticsExport.objects.filter(recruiter=request.user)
    
    debug_info = []
    for export in exports:
        debug_info.append({
            'id': export.id,
            'export_type': export.export_type,
            'format': export.format,
            'status': export.status,
            'file_exists': bool(export.file),
            'file_name': export.file.name if export.file else None,
            'created_at': export.created_at,
            'completed_at': export.completed_at
        })
    
    return Response({
        'exports': debug_info,
        'total': len(debug_info)
    })

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
    """Download export file - FIXED VERSION"""
    try:
        export = AnalyticsExport.objects.get(id=export_id, recruiter=request.user)
        
        if export.status != 'COMPLETED' or not export.file:
            return Response({
                'success': False,
                'error': 'Export not ready or file missing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        content_types = {
            'EXCEL': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'CSV': 'text/csv; charset=utf-8',
            'JSON': 'application/json; charset=utf-8',
            'PDF': 'application/pdf'
        }
        
        file_extensions = {
            'EXCEL': 'xlsx',
            'CSV': 'csv',
            'JSON': 'json',
            'PDF': 'pdf'
        }
        
        content_type = content_types.get(export.format, 'application/octet-stream')
        file_extension = file_extensions.get(export.format, 'bin')
        
        export.file.open('rb')
        file_content = export.file.read()
        export.file.close()
        
        filename = f"{export.export_type.lower()}_export_{export.id}.{file_extension}"
        
        response = HttpResponse(file_content, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except AnalyticsExport.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Export not found'
        }, status=status.HTTP_404_NOT_FOUND)