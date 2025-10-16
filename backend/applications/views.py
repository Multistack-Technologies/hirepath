# backend/applications/views.py
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Application
from jobs.models import Job
from .serializers import ApplicationSerializer

# Graduate applies to job
class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

# Graduate views their applications
class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user)

# Recruiter views applications for their jobs
class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(job__created_by=self.request.user)

# --- NEW STATS ENDPOINTS ---

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def graduate_stats(request):
    """Get statistics for graduate dashboard"""
    try:
        user = request.user
        
        # Count total active jobs in the system
        total_jobs = Job.objects.count()  # You might want to add is_active field later
        
        # Count user's applications in different statuses
        applications = Application.objects.filter(applicant=user)
        active_applications = applications.filter(
            status__in=[Application.Status.PENDING, Application.Status.REVIEWED]
        ).count()
        
        shortlisted = applications.filter(status=Application.Status.SHORTLISTED).count()
        hired = applications.filter(status=Application.Status.ACCEPTED).count()
        
        stats = {
            'totalJobs': total_jobs,
            'activeApplications': active_applications,
            'shortlisted': shortlisted,
            'hired': hired
        }
        
        return Response(stats)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recruiter_stats(request):
    """Get statistics for recruiter dashboard"""
    try:
        user = request.user
        
        # Count jobs posted by this recruiter
        recruiter_jobs = Job.objects.filter(created_by=user)
        total_jobs = recruiter_jobs.count()
        
        # Count applications for recruiter's jobs
        applications = Application.objects.filter(job__in=recruiter_jobs)
        
        active_applications = applications.filter(
            status__in=[Application.Status.PENDING, Application.Status.REVIEWED]
        ).count()
        
        shortlisted = applications.filter(status=Application.Status.SHORTLISTED).count()
        hired = applications.filter(status=Application.Status.ACCEPTED).count()
        
        stats = {
            'totalJobs': total_jobs,
            'activeApplications': active_applications,
            'shortlisted': shortlisted,
            'hired': hired
        }
        
        return Response(stats)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recruiter_candidates(request):
    """Get candidates who applied to recruiter's jobs"""
    try:
        user = request.user
        
        # Get applications for recruiter's jobs
        applications = Application.objects.filter(
            job__created_by=user
        ).select_related(
            'applicant', 
            'job',
            'job__company'
        ).order_by('-applied_at')
        
        candidates_data = []
        for application in applications:
            # Ensure match score is calculated
            if application.match_score is None:
                application.match_score = application.calculate_match_score()
                application.save()
            
            match_details = application.calculate_match_details()
            
            candidate_data = {
                'id': application.id,  # Use application ID
                'first_name': application.applicant.first_name,
                'last_name': application.applicant.last_name,
                'email': application.applicant.email,
                'location': application.job.location,  # Using job location as fallback
                'applied_date': application.applied_at.strftime('%Y-%m-%d'),
                'match_score': application.match_score or 0,
                'match_details': match_details,
                'job_title': application.job.title,
                'company_name': application.job.company.name,
                'application_status': application.status,
            }
            candidates_data.append(candidate_data)
        
        return Response({'results': candidates_data})
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)