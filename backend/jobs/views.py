from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from datetime import date
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Job
from .serializers import JobSerializer, JobCreateSerializer, JobListSerializer

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
        return Job.objects.filter(created_by=user).order_by("-created_at")

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Job.objects.filter(created_by=user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobCreateSerializer
        return JobSerializer

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
    ).order_by("-created_at")
    
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