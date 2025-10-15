from rest_framework import serializers
from .models import Resume

class ResumeUploadSerializer(serializers.Serializer):
   
    file = serializers.FileField()
    job_role = serializers.CharField(required=False, default="Junior Developer")

class ResumeFeedbackSerializer(serializers.ModelSerializer):
  
    class Meta:
        model = Resume
        fields = ['id', 'score', 'skills_detected', 'missing_skills', 'feedback', 'job_role_matched', 'uploaded_at']
        read_only_fields = ['id', 'score', 'skills_detected', 'missing_skills', 'feedback', 'job_role_matched', 'uploaded_at']