from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import models  # Add this import
from .models import JobRole
from .serializers import JobRoleSerializer, JobRoleListSerializer


class JobRoleListView(generics.ListAPIView):
    serializer_class = JobRoleListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        queryset = JobRole.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
            
        # Filter by in-demand roles
        in_demand = self.request.query_params.get('in_demand')
        if in_demand:
            queryset = queryset.filter(is_in_demand=True)
            
        return queryset.select_related().prefetch_related('skills')

class JobRoleDetailView(generics.RetrieveAPIView):
    queryset = JobRole.objects.all()
    serializer_class = JobRoleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class JobRoleCreateView(generics.CreateAPIView):
    queryset = JobRole.objects.all()
    serializer_class = JobRoleSerializer
    permission_classes = [permissions.IsAdminUser]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def job_role_search(request):
    """Search job roles by title"""
    search_query = request.GET.get('q', '')
    
    if search_query:
        job_roles = JobRole.objects.filter(title__icontains=search_query)[:10]
    else:
        job_roles = JobRole.objects.none()
    
    serializer = JobRoleListSerializer(job_roles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def in_demand_roles(request):
    """Get in-demand job roles"""
    job_roles = JobRole.objects.filter(is_in_demand=True)
    serializer = JobRoleListSerializer(job_roles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def job_role_categories(request):
    """Get list of job role categories"""
    categories = dict(JobRole.CATEGORY_CHOICES)
    return Response(categories)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def job_role_stats(request):
    """Get job role statistics"""
    stats = {
        'total_roles': JobRole.objects.count(),
        'in_demand_roles': JobRole.objects.filter(is_in_demand=True).count(),
        'by_category': list(JobRole.objects.values('category').annotate(count=models.Count('id'))),
    }
    return Response(stats)