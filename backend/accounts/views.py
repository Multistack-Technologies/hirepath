from rest_framework import generics, permissions, status
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db import transaction
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import base64
from job_roles.models import JobRole
from job_roles.serializers import JobRoleSerializer

from skills.models import Skill
from skills.serializers import SkillSerializer
from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer, UserSerializer, UserProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        user_data = UserSerializer(user, context={'request': request}).data

        return Response({
            "refresh": str(refresh),
            "access": str(access),
            **user_data
        })

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user, context={'request': request})
    return Response(serializer.data)

@api_view(["PUT", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """Update user profile information including avatar"""
    user = request.user
    
    # Handle base64 avatar data if sent
    if 'avatar' in request.data and isinstance(request.data['avatar'], str) and request.data['avatar'].startswith('data:image'):
        try:
            # Extract base64 data
            format, imgstr = request.data['avatar'].split(';base64,') 
            ext = format.split('/')[-1] 
            
            # Create file content
            data = ContentFile(base64.b64decode(imgstr), name=f'avatar_{user.id}.{ext}')
            request.data['avatar'] = data
        except Exception as e:
            return Response(
                {'error': f'Invalid image data: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    serializer = UserProfileSerializer(
        user, 
        data=request.data, 
        partial=True,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def ping(request):
    return Response({"message": "accounts app is alive"})

@api_view(["PUT"])
@permission_classes([permissions.IsAuthenticated])
def update_skills(request):
    user = request.user
    skill_ids = request.data.get("skills", [])

    # Replace existing skills with new ones
    user.skills.set(Skill.objects.filter(id__in=skill_ids))
    user.save()

    return Response(UserSerializer(user, context={'request': request}).data)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_user_skills(request):
    """Get current user's skills"""
    user = request.user
    skills = user.skills.all()
    serializer = SkillSerializer(skills, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def set_user_skills(request):
    """Set user's skills (replace all existing skills)"""
    user = request.user
    skill_ids = request.data.get("skill_ids", [])
    
    try:
        with transaction.atomic():
            # Clear existing skills and add new ones
            user.skills.clear()
            
            if skill_ids:
                skills_to_add = Skill.objects.filter(id__in=skill_ids)
                user.skills.add(*skills_to_add)
            
            # Return updated skills
            updated_skills = user.skills.all()
            serializer = SkillSerializer(updated_skills, many=True)
            
            return Response({
                'message': 'Skills updated successfully',
                'skills': serializer.data
            })
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def add_user_skill(request):
    """Add a single skill to user"""
    user = request.user
    skill_id = request.data.get('skill_id')
    
    if not skill_id:
        return Response(
            {'error': 'skill_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        skill = Skill.objects.get(id=skill_id)
    except Skill.DoesNotExist:
        return Response(
            {'error': 'Skill not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    user.skills.add(skill)
    
    return Response({
        'message': 'Skill added successfully',
        'skill': SkillSerializer(skill).data
    })

@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def remove_user_skill(request, skill_id):
    """Remove a skill from user"""
    user = request.user
    
    try:
        skill = Skill.objects.get(id=skill_id)
    except Skill.DoesNotExist:
        return Response(
            {'error': 'Skill not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    user.skills.remove(skill)
    
    return Response({
        'message': 'Skill removed successfully'
    })

@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def delete_avatar(request):
    """Delete user's avatar"""
    user = request.user
    
    if user.avatar:
        # Delete the file from storage
        user.avatar.delete(save=False)
        # Clear the field
        user.avatar = None
        user.save()
        
        return Response({
            'message': 'Avatar deleted successfully'
        })
    
    return Response({
        'message': 'No avatar to delete'
    })

# Add these views to accounts/views.py
@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def manage_target_job_roles(request):
    """Get or set user's target job roles"""
    user = request.user
    
    if request.method == 'GET':
        target_roles = user.target_job_roles.all()
        serializer = JobRoleSerializer(target_roles, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        job_role_ids = request.data.get('job_role_ids', [])
        
        try:
            job_roles = JobRole.objects.filter(id__in=job_role_ids)
            user.target_job_roles.set(job_roles)
            
            serializer = JobRoleSerializer(user.target_job_roles.all(), many=True)
            return Response({
                'message': 'Target job roles updated successfully',
                'target_job_roles': serializer.data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_current_job_role(request):
    """Set user's current job role"""
    user = request.user
    job_role_id = request.data.get('job_role_id')
    
    if not job_role_id:
        return Response(
            {'error': 'job_role_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        job_role = JobRole.objects.get(id=job_role_id)
        user.current_job_role = job_role
        user.save()
        
        serializer = JobRoleSerializer(job_role)
        return Response({
            'message': 'Current job role updated successfully',
            'current_job_role': serializer.data
        })
    except JobRole.DoesNotExist:
        return Response(
            {'error': 'Job role not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_current_job_role(request):
    """Remove user's current job role"""
    user = request.user
    user.current_job_role = None
    user.save()
    
    return Response({
        'message': 'Current job role removed successfully'
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def job_role_recommendations(request):
    """Get job role recommendations based on user skills"""
    user = request.user
    user_skills = set(user.skills.values_list('name', flat=True))
    
    # Get all job roles
    all_job_roles = JobRole.objects.prefetch_related('skills').all()
    recommendations = []
    
    for job_role in all_job_roles:
        required_skills = set(job_role.skills.values_list('name', flat=True))
        matching_skills = user_skills.intersection(required_skills)
        match_percentage = (len(matching_skills) / len(required_skills)) * 100 if required_skills else 0
        
        recommendations.append({
            'job_role': JobRoleSerializer(job_role).data,
            'match_percentage': round(match_percentage, 2),
            'matching_skills': list(matching_skills),
            'missing_skills': list(required_skills - user_skills)
        })
    
    # Sort by match percentage (descending)
    recommendations.sort(key=lambda x: x['match_percentage'], reverse=True)
    
    return Response(recommendations[:10])  # Return top 10 recommendations