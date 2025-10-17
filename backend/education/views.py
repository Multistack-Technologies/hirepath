from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from .models import Education
from .serializers import EducationSerializer, EducationCreateSerializer

class EducationListCreateView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user).select_related(
            'university', 'degree'
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EducationCreateSerializer
        return EducationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user).select_related(
            'university', 'degree'
        )

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EducationCreateSerializer
        return EducationSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_educations(request):
    """Get all educations for current user"""
    educations = Education.objects.filter(user=request.user).select_related(
        'university', 'degree'
    )
    
    serializer = EducationSerializer(educations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_education(request):
    """Create new education for current user"""
    serializer = EducationCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                education = serializer.save(user=request.user)
                # Return full education data
                full_serializer = EducationSerializer(education)
                return Response(full_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def education_stats(request):
    """Get education statistics for current user"""
    educations = Education.objects.filter(user=request.user)
    
    stats = {
        'total_educations': educations.count(),
        'current_educations': educations.filter(is_current=True).count(),
        'completed_educations': educations.filter(is_current=False).count(),
        'universities_attended': educations.values('university').distinct().count(),
    }
    
    return Response(stats)