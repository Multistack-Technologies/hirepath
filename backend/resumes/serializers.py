from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'file', 'file_name', 'file_type', 'text', 'ai_feedback', 'uploaded_at']
        read_only_fields = ['text', 'ai_feedback', 'uploaded_at']