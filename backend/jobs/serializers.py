from rest_framework import serializers

from skills.models import Skill
from skills.serializers import SkillSerializer
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    skills_required = SkillSerializer(many=True, read_only=True)
    skills_required_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), write_only=True, source="skills_required"
    )

    class Meta:
        model = Job
        fields = [
            "id", "title", "description", "company", "company_name",
            "location", "skills_required", "skills_required_ids",
            "created_at", "created_by"
        ]
        read_only_fields = ["id", "created_at", "created_by", "company_name"]

    # def create(self, validated_data):
    #     user = self.context["request"].user
    #     return Job.objects.create(created_by=user, **validated_data)
