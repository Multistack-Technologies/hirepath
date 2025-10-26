from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from datetime import date
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Job
from .serializers import JobSerializer, JobCreateSerializer, JobListSerializer

# Import for job analysis
from ai.services import ai_engine
import logging

logger = logging.getLogger(__name__)

class JobListCreateView(generics.ListCreateAPIView):
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return JobCreateSerializer
        return JobListSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, "company"):
            raise PermissionError("You must create a company profile before posting jobs.")
        serializer.save(created_by=user, company=user.company)

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Prefetch related data to optimize queries
        queryset = queryset.select_related('company').prefetch_related('skills_required', 'applications')
        
        # Filter by employment type
        employment_type = self.request.query_params.get('employment_type')
        if employment_type:
            queryset = queryset.filter(employment_type=employment_type)
        
        # Filter by work type
        work_type = self.request.query_params.get('work_type')
        if work_type:
            queryset = queryset.filter(work_type=work_type)
        
        # Filter by experience level
        experience_level = self.request.query_params.get('experience_level')
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)
        
        # Filter by skills
        skills = self.request.query_params.getlist('skills')
        if skills:
            queryset = queryset.filter(skills_required__id__in=skills).distinct()
        
        # Filter by location (case-insensitive partial match)
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by company
        company = self.request.query_params.get('company')
        if company:
            queryset = queryset.filter(company__name__icontains=company)
        
        return queryset

class MyJobListView(generics.ListAPIView):
    serializer_class = JobListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Job.objects.filter(created_by=user).select_related('company').prefetch_related('skills_required', 'applications').order_by("-created_at")

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Job.objects.filter(created_by=user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH','GET']:
            return JobCreateSerializer
        return JobSerializer

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        return obj
    
class JobPublicDetailView(generics.RetrieveAPIView):
    """Public view for anyone to view job details (read-only)"""
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]  

    def get_queryset(self):
        return Job.objects.select_related('company').prefetch_related('skills_required', 'applications')

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        return obj

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def active_jobs(request):
    """Get all active jobs (not expired)"""
    jobs = Job.objects.filter(
        models.Q(closing_date__gte=date.today()) | 
        models.Q(closing_date__isnull=True)
    ).select_related('company').prefetch_related('skills_required', 'applications').order_by("-created_at")
    
    # Apply filters to active jobs as well
    employment_type = request.query_params.get('employment_type')
    if employment_type:
        jobs = jobs.filter(employment_type=employment_type)
    
    work_type = request.query_params.get('work_type')
    if work_type:
        jobs = jobs.filter(work_type=work_type)
    
    serializer = JobListSerializer(jobs, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def job_categories(request):
    """Get available job categories and filters"""
    categories = {
        'employment_types': dict(Job.EMPLOYMENT_TYPES),
        'work_types': dict(Job.WORK_TYPES),
        'experience_levels': dict(Job.EXPERIENCE_LEVELS),
    }
    return Response(categories)

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def job_stats(request):
    """Get job statistics"""
    total_jobs = Job.objects.count()
    active_jobs_count = Job.objects.filter(
        models.Q(closing_date__gte=date.today()) | 
        models.Q(closing_date__isnull=True)
    ).count()
    
    # Count by employment type
    employment_stats = {}
    for employment_type, display_name in Job.EMPLOYMENT_TYPES:
        count = Job.objects.filter(employment_type=employment_type).count()
        employment_stats[employment_type] = {
            'display_name': display_name,
            'count': count
        }
    
    # Count by work type
    work_stats = {}
    for work_type, display_name in Job.WORK_TYPES:
        count = Job.objects.filter(work_type=work_type).count()
        work_stats[work_type] = {
            'display_name': display_name,
            'count': count
        }
    
    return Response({
        'total_jobs': total_jobs,
        'active_jobs': active_jobs_count,
        'employment_types': employment_stats,
        'work_types': work_stats,
    })

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def ping(request):
    return Response({"message": "jobs app is alive"})

# JOB ANALYSIS ENDPOINT
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analyze_job(request, job_id):
    """
    Analyze job compatibility for graduate using their profile data
    GET /api/jobs/{job_id}/analyze/
    """
    try:
        job = get_object_or_404(Job, pk=job_id)
        user = request.user  # Graduate from JWT token

        # Get user profile data from their account
        user_data = get_user_profile_data(user)
        
        # Check if user has basic profile data with better feedback
        skills_count = len(user_data.get('skills', []))
        educations_count = len(user_data.get('educations', []))
        
        if skills_count == 0:
            return Response(
                {
                    'error': 'Skills required',
                    'message': 'Please add skills to your profile to analyze jobs.',
                    'profile_status': {
                        'has_skills': False,
                        'has_education': educations_count > 0,
                        'skills_count': skills_count,
                        'educations_count': educations_count
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        job_data = get_job_data(job)

        # Get AI analysis
        analysis_result = ai_engine.analyze_application_match(
            applicant_data=user_data,
            job_data=job_data,
            cover_letter=""
        )

        # Prepare response
        response_data = {
            'job': {
                'id': job.id,
                'title': job.title,
                'company': job.company.name,
                'location': job.location,
                'employment_type': job.get_employment_type_display(),
                'work_type': job.get_work_type_display(),
                'experience_level': job.get_experience_level_display(),
                'salary_range': get_salary_range(job),
                'closing_date': job.closing_date,
                'days_remaining': get_days_remaining(job),
            },
            'profile_summary': {
                'skills_count': skills_count,
                'educations_count': educations_count,
                'experiences_count': len(user_data.get('experiences', [])),
                'certificates_count': len(user_data.get('certificates', []))
            },
            'analysis': {
                'match_score': analysis_result['match_score'],
                'match_quality': get_match_quality(analysis_result['match_score']),
                'skills_match': analysis_result['analysis'].get('skills_assessment', {}),
                'education_match': analysis_result['analysis'].get('education_assessment', {}),
                'certification_match': analysis_result['analysis'].get('certification_assessment', {}),
                'feedback': analysis_result['feedback']
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Job analysis failed: {e}")
        return Response(
            {'error': 'Analysis failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    """
    Analyze job compatibility for graduate using their profile data
    GET /api/jobs/{job_id}/analyze/
    """
    try:
        job = get_object_or_404(Job, pk=job_id)
        user = request.user  # Graduate from JWT token

        # Get user profile data from their account
        user_data = get_user_profile_data(user)
        
        # Check if user has basic profile data
        if not user_data.get('skills'):
            return Response(
                {'error': 'Please add skills to your profile to analyze jobs.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        job_data = get_job_data(job)

        # Get AI analysis
        analysis_result = ai_engine.analyze_application_match(
            applicant_data=user_data,
            job_data=job_data,
            cover_letter=""
        )

        # Prepare response
        response_data = {
            'job': {
                'id': job.id,
                'title': job.title,
                'company': job.company.name,
                'location': job.location,
                'employment_type': job.get_employment_type_display(),
                'work_type': job.get_work_type_display(),
                'experience_level': job.get_experience_level_display(),
                'salary_range': get_salary_range(job),
                'closing_date': job.closing_date,
                'days_remaining': get_days_remaining(job),
            },
            'analysis': {
                'match_score': analysis_result['match_score'],
                'match_quality': get_match_quality(analysis_result['match_score']),
                'skills_match': analysis_result['analysis'].get('skills_assessment', {}),
                'education_match': analysis_result['analysis'].get('education_assessment', {}),
                'certification_match': analysis_result['analysis'].get('certification_assessment', {}),
                'feedback': analysis_result['feedback']
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Job.DoesNotExist:
        return Response(
            {'error': 'Job not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Job analysis failed: {e}")
        return Response(
            {'error': 'Analysis failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# Helper functions for job analysis
def get_user_profile_data(user):
    """Extract user profile data for analysis - using your complete model structure"""
    try:
        profile_data = {
            "skills": [],
            "educations": [],
            "experiences": [],
            "certificates": [],
        }
        
        # Get skills
        try:
            if hasattr(user, 'skills') and user.skills.exists():
                profile_data["skills"] = list(user.skills.values_list('name', flat=True))
            else:
                profile_data["skills"] = []
        except Exception as e:
            logger.warning(f"Error fetching user skills: {e}")
            profile_data["skills"] = []
        
        # Get education data
        try:
            if hasattr(user, 'educations') and user.educations.exists():
                for edu in user.educations.all():
                    education_info = {
                        "degree": edu.degree.name if edu.degree else "",
                        "institution": edu.university.name if edu.university else "",
                        "field_of_study": "",  # Your Education model doesn't have field_of_study
                        "graduation_year": edu.end_date.year if edu.end_date else None
                    }
                    profile_data["educations"].append(education_info)
        except Exception as e:
            logger.warning(f"Error fetching user education: {e}")
        
        # Get work experience data
        try:
            if hasattr(user, 'work_experiences') and user.work_experiences.exists():
                for exp in user.work_experiences.all():
                    # Calculate duration in months
                    duration_months = 0
                    if exp.start_date and exp.end_date:
                        from dateutil.relativedelta import relativedelta
                        delta = relativedelta(exp.end_date, exp.start_date)
                        duration_months = delta.years * 12 + delta.months
                    elif exp.start_date and exp.is_current:
                        from datetime import date
                        today = date.today()
                        delta = relativedelta(today, exp.start_date)
                        duration_months = delta.years * 12 + delta.months
                    
                    profile_data["experiences"].append({
                        "title": exp.job_title,
                        "company": exp.company_name,
                        "duration_months": duration_months,
                        "description": exp.description or ""
                    })
        except Exception as e:
            logger.warning(f"Error fetching user work experiences: {e}")
        
        # Get certificates
        try:
            if hasattr(user, 'certificates') and user.certificates.exists():
                for cert in user.certificates.all():
                    certificate_info = {
                        "name": cert.provider.name if cert.provider else "",
                        "provider": cert.provider.name if cert.provider else "",
                        "year_obtained": cert.issue_date.year if cert.issue_date else None
                    }
                    profile_data["certificates"].append(certificate_info)
        except Exception as e:
            logger.warning(f"Error fetching user certificates: {e}")
        
        logger.info(f"Extracted profile data for user {user.id}: {len(profile_data['skills'])} skills, {len(profile_data['educations'])} educations")
        return profile_data
        
    except Exception as e:
        logger.error(f"Critical error extracting user profile: {e}")
        return {"skills": [], "educations": [], "experiences": [], "certificates": []}


def get_job_data(job):
    """Extract job data for analysis"""
    try:
        job_data = {
            "title": job.title,
            "description": job.description,
            "skills_required": list(job.skills_required.values_list('name', flat=True)),
            "experience_level": job.experience_level,
            "courses_preferred": list(job.courses_preferred.values_list('name', flat=True)),
            "certificates_preferred": list(job.certificates_preferred.values_list('name', flat=True)),
        }
        return job_data
    except Exception as e:
        logger.error(f"Error extracting job data: {e}")
        return {}

def get_salary_range(job):
    """Get formatted salary range"""
    if job.min_salary and job.max_salary:
        return f"R{job.min_salary:,} - R{job.max_salary:,}"
    elif job.min_salary:
        return f"From R{job.min_salary:,}"
    elif job.max_salary:
        return f"Up to R{job.max_salary:,}"
    return "Not specified"

def get_days_remaining(job):
    """Calculate days remaining to apply"""
    from datetime import date
    if job.closing_date:
        today = date.today()
        remaining = (job.closing_date - today).days
        return max(0, remaining)
    return None

def get_match_quality(score):
    """Get match quality description"""
    if score >= 80:
        return "Excellent Match"
    elif score >= 70:
        return "Good Match" 
    elif score >= 60:
        return "Fair Match"
    elif score >= 50:
        return "Moderate Match"
    else:
        return "Needs Improvement"