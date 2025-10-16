# backend/skills/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from .models import Skill
from .serializers import SkillSerializer

class SkillListCreateView(generics.ListCreateAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]

class UserSkillsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's skills"""
        try:
            user_profile = request.user.profile
            skills = user_profile.skills.all()
            serializer = SkillSerializer(skills, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': 'User profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request):
        """Update user's skills"""
        try:
            user_profile = request.user.profile
            skill_ids = request.data.get('skill_ids', [])
            
            # Validate that all skill IDs exist
            existing_skills = Skill.objects.filter(id__in=skill_ids)
            if len(existing_skills) != len(skill_ids):
                return Response(
                    {'error': 'One or more skill IDs are invalid'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update user's skills
            user_profile.skills.set(existing_skills)
            
            # Return updated skills
            updated_skills = user_profile.skills.all()
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

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_skill_to_user(request):
    """Add a single skill to user's profile"""
    try:
        user_profile = request.user.profile
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
        
        user_profile.skills.add(skill)
        
        return Response({
            'message': 'Skill added successfully',
            'skill': SkillSerializer(skill).data
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_skill_from_user(request, skill_id):
    """Remove a skill from user's profile"""
    try:
        user_profile = request.user.profile
        
        try:
            skill = Skill.objects.get(id=skill_id)
        except Skill.DoesNotExist:
            return Response(
                {'error': 'Skill not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user_profile.skills.remove(skill)
        
        return Response({
            'message': 'Skill removed successfully'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )