from django.shortcuts import get_object_or_404
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

class MyJobListView(generics.ListAPIView):
    serializer_class = JobSerializer
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
    from django.utils import timezone
    from datetime import date
    
    jobs = Job.objects.filter(
        models.Q(closing_date__gte=date.today()) | 
        models.Q(closing_date__isnull=True)
    ).order_by("-created_at")
    
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
def ping(request):
    return Response({"message": "jobs app is alive"})