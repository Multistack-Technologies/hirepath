from rest_framework import serializers
from .models import JobRole
from skills.models import Skill
from skills.serializers import SkillSerializer

class JobRoleSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all(),
        source='skills',
        write_only=True,
        required=False
    )
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = JobRole
        fields = [
            'id', 'title', 'category', 'category_display', 'description', 
            'skills', 'skill_ids', 'is_in_demand', 'remote_friendly', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class JobRoleListSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    skills_count = serializers.SerializerMethodField()

    class Meta:
        model = JobRole
        fields = [
            'id', 'title', 'category_display', 'is_in_demand', 
            'remote_friendly', 'skills_count'
        ]

    def get_skills_count(self, obj):
        return obj.skills.count()