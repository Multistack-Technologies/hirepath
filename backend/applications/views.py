# backend/applications/views.py
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.shortcuts import get_object_or_404

from rest_framework import serializers 
from .models import Application
from jobs.models import Job
from .serializers import (
    ApplicationSerializer, 
    ApplicationCreateSerializer,
    ApplicationStatusUpdateSerializer
)

# Graduate applies to job
class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        job = serializer.validated_data['job']
        
        # Check if user already applied
        if Application.objects.filter(job=job, applicant=self.request.user).exists():
            raise serializers.ValidationError("You have already applied to this job.")
        
        # Check if job is still active
        if not job.is_active:
            raise serializers.ValidationError("This job is no longer accepting applications.")
        
        serializer.save(applicant=self.request.user)

# Graduate views their applications
class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user).select_related(
            'job', 'job__company'
        )

# Recruiter views applications for their jobs
class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs['job_id']
        return Application.objects.filter(
            job__id=job_id, 
            job__created_by=self.request.user
        ).select_related('applicant', 'job', 'job__company')

class ApplicationStatusUpdateView(generics.UpdateAPIView):
    serializer_class = ApplicationStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(job__created_by=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def withdraw_application(request, application_id):
    """Allow graduates to withdraw their application"""
    try:
        application = get_object_or_404(
            Application, 
            id=application_id, 
            applicant=request.user
        )
        
        if application.status in [Application.Status.ACCEPTED, Application.Status.REJECTED]:
            return Response(
                {'error': 'Cannot withdraw application in current status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        application.status = Application.Status.WITHDRAWN
        application.save()
        
        return Response({'message': 'Application withdrawn successfully'})
    
    except Application.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

# --- ENHANCED STATS ENDPOINTS ---

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def graduate_stats(request):
    """Get comprehensive statistics for graduate dashboard"""
    try:
        user = request.user
        
        applications = Application.objects.filter(applicant=user)
        
        # Fix: Proper status count aggregation
        status_counts = applications.values('status').annotate(
            count=Count('id')
        )
        applications_by_status = {
            item['status']: item['count'] 
            for item in status_counts
        }
        
        # Fix: Calculate recent applications properly
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        stats = {
            'totalApplications': applications.count(),
            'applicationsByStatus': applications_by_status,
            'averageMatchScore': applications.aggregate(
                avg_score=Avg('match_score')
            )['avg_score'] or 0,
            'recentApplications': applications.filter(
                applied_at__gte=thirty_days_ago
            ).count(),
            'topMatchedJobs': list(
                applications.filter(match_score__gte=80)
                .values('job__title', 'match_score')
                .order_by('-match_score')[:5]
            )
        }
        
        return Response(stats)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recruiter_stats(request):
    """Get comprehensive statistics for recruiter dashboard"""
    try:
        user = request.user
        
        recruiter_jobs = Job.objects.filter(created_by=user)
        applications = Application.objects.filter(job__in=recruiter_jobs)
        
        # Fix: Proper status count aggregation
        status_counts = applications.values('status').annotate(
            count=Count('id')
        )
        applications_by_status = {
            item['status']: item['count'] 
            for item in status_counts
        }
        
        # Fix: Applications by job with proper annotation
        applications_by_job = list(
            recruiter_jobs.annotate(
                application_count=Count('applications'),
                avg_match_score=Avg('applications__match_score')
            ).values('id', 'title', 'application_count', 'avg_match_score')
        )
        
        stats = {
            'totalJobs': recruiter_jobs.count(),
            'totalApplications': applications.count(),
            'applicationsByStatus': applications_by_status,
            'averageMatchScore': applications.aggregate(
                avg_score=Avg('match_score')
            )['avg_score'] or 0,
            'applicationsByJob': applications_by_job
        }
        
        return Response(stats)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recruiter_candidates(request):
    """Get enhanced candidates list with filtering"""
    try:
        user = request.user
        
        status_filter = request.GET.get('status', '')
        min_match_score = request.GET.get('min_score', 0)
        
        applications = Application.objects.filter(
            job__created_by=user
        ).select_related(
            'applicant', 'job', 'job__company'
        )
        
        # Apply filters
        if status_filter:
            applications = applications.filter(status=status_filter)
        
        if min_match_score:
            try:
                applications = applications.filter(
                    match_score__gte=float(min_match_score)
                )
            except ValueError:
                pass  # Ignore invalid min_score values
        
        applications = applications.order_by('-match_score', '-applied_at')
        
        candidates_data = []
        for application in applications:
            # Fix: Handle potential None match_score
            current_match_score = application.match_score or 0
            
            # Fix: Calculate match details safely
            try:
                match_details = application.calculate_match_details()
            except Exception:
                match_details = {
                    "skills_matched": [],
                    "skills_missing": [],
                    "feedback": ["Error calculating match details"]
                }
            
            candidate_data = {
                'application_id': application.id,
                'applicant_id': application.applicant.id,
                'first_name': application.applicant.first_name or 'N/A',
                'last_name': application.applicant.last_name or 'N/A',
                'email': application.applicant.email,
                'location': application.applicant.location or 'Not specified',
                'current_job_title': application.applicant.job_title or 'Not specified',
                'applied_date': application.applied_at.strftime('%Y-%m-%d'),
                'match_score': current_match_score,
                'match_details': match_details,
                'job_title': application.job.title,
                'company_name': application.job.company.name,
                'application_status': application.status,
                'cover_letter': application.cover_letter or '',
                'notes': application.notes or '',
                'interview_date': application.interview_date,
            }
            candidates_data.append(candidate_data)
        
        return Response({
            'results': candidates_data,
            'total_count': len(candidates_data),
            'filters_applied': {
                'status': status_filter,
                'min_match_score': min_match_score
            }
        })
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Graduate views specific application details - returns same object as list
class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user).select_related(
            'job', 'job__company', 'applicant'
        )

    def get_object(self):
        application = get_object_or_404(
            Application, 
            id=self.kwargs['application_id'],
            applicant=self.request.user
        )
        return application

# Recruiter views specific application details - returns same object as list
class RecruiterApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            job__created_by=self.request.user
        ).select_related('applicant', 'job', 'job__company')

    def get_object(self):
        application = get_object_or_404(
            Application, 
            id=self.kwargs['application_id'],
            job__created_by=self.request.user
        )
        return application

# Single endpoint that handles both graduate and recruiter with proper permissions
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def application_details(request, application_id):
    """Get application details - returns same object as list endpoints"""
    try:
        application = get_object_or_404(Application, id=application_id)
        
        # Check permissions
        if not (application.applicant == request.user or 
                application.job.created_by == request.user):
            return Response(
                {'error': 'You do not have permission to view this application'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Use the same serializer as list views
        serializer = ApplicationSerializer(application, context={'request': request})
        return Response(serializer.data)
    
    except Application.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)