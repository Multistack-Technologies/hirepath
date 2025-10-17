from rest_framework import serializers
from .models import CertificateProvider
from skills.models import Skill
from skills.serializers import SkillSerializer

class CertificateProviderSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all(),
        source='skills',
        write_only=True,
        required=False
    )
    issuer_type_display = serializers.CharField(source='get_issuer_type_display', read_only=True)

    class Meta:
        model = CertificateProvider
        fields = [
            'id', 'name', 'issuer_name', 'issuer_type', 'issuer_type_display',
            'description', 'website', 'skills', 'skill_ids', 'is_popular',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class CertificateProviderListSerializer(serializers.ModelSerializer):
    issuer_type_display = serializers.CharField(source='get_issuer_type_display', read_only=True)
    skills_count = serializers.SerializerMethodField()

    class Meta:
        model = CertificateProvider
        fields = [
            'id', 'name', 'issuer_name', 'issuer_type_display',
            'website', 'is_popular', 'skills_count'
        ]

    def get_skills_count(self, obj):
        return obj.skills.count()