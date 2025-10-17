from rest_framework import serializers
from .models import WorkExperience

class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = [
            'id', 'user', 'company_name', 'job_title', 'is_current',
            'description', 'start_date', 'end_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)
        
        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({
                "end_date": "End date cannot be before start date."
            })
        
        if is_current and end_date:
            raise serializers.ValidationError({
                "end_date": "Current positions cannot have an end date."
            })
        
        return data

class WorkExperienceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = [
            'company_name', 'job_title', 'is_current', 'description',
            'start_date', 'end_date'
        ]