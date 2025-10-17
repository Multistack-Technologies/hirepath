from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from .models import WorkExperience
from .serializers import WorkExperienceSerializer, WorkExperienceCreateSerializer

class WorkExperienceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkExperience.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WorkExperienceCreateSerializer
        return WorkExperienceSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WorkExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkExperience.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return WorkExperienceCreateSerializer
        return WorkExperienceSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_work_experiences(request):
    """Get all work experiences for current user"""
    work_experiences = WorkExperience.objects.filter(user=request.user)
    serializer = WorkExperienceSerializer(work_experiences, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_work_experience(request):
    """Create new work experience for current user"""
    serializer = WorkExperienceCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                work_experience = serializer.save(user=request.user)
                full_serializer = WorkExperienceSerializer(work_experience)
                return Response(full_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def work_experience_stats(request):
    """Get work experience statistics for current user"""
    work_experiences = WorkExperience.objects.filter(user=request.user)
    
    stats = {
        'total_experiences': work_experiences.count(),
        'current_positions': work_experiences.filter(is_current=True).count(),
        'past_positions': work_experiences.filter(is_current=False).count(),
        'companies_count': work_experiences.values('company_name').distinct().count(),
    }
    
    return Response(stats)