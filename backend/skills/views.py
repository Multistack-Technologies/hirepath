from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from .models import Skill
from .serializers import SkillSerializer

class SkillListCreateView(generics.ListCreateAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
