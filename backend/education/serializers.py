from rest_framework import serializers
from .models import Education
from universities.models import University
from degrees.models import Degree
from universities.serializers import UniversitySerializer
from degrees.serializers import DegreeSerializer

class EducationSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(), 
        source='university',
        write_only=True
    )
    degree = DegreeSerializer(read_only=True)
    degree_id = serializers.PrimaryKeyRelatedField(
        queryset=Degree.objects.all(), 
        source='degree',
        write_only=True
    )
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = [
            'id', 'user', 'university', 'university_id', 'degree', 'degree_id',
            'start_date', 'end_date', 'is_current', 'gpa', 'gpa_scale',
            'description', 'duration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_duration(self, obj):
        if obj.end_date:
            duration = obj.end_date.year - obj.start_date.year
            if obj.end_date.month < obj.start_date.month:
                duration -= 1
            return f"{duration} year{'s' if duration != 1 else ''}"
        return "Ongoing"

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if end_date and start_date > end_date:
            raise serializers.ValidationError({
                "end_date": "End date cannot be before start date."
            })
        
        return data

class EducationCreateSerializer(serializers.ModelSerializer):
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(), 
        source='university'
    )
    degree_id = serializers.PrimaryKeyRelatedField(
        queryset=Degree.objects.all(), 
        source='degree'
    )

    class Meta:
        model = Education
        fields = [
            'university_id', 'degree_id', 'start_date', 'end_date',
            'gpa', 'gpa_scale', 'description'
        ]