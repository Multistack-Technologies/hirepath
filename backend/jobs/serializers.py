from rest_framework import serializers
from skills.models import Skill
from skills.serializers import SkillSerializer
from certificates.models import Certificate
from certificates.serializers import CertificateSerializer
from degrees.models import Degree
from degrees.serializers import DegreeSerializer
from companies.serializers import CompanySerializer
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_logo = serializers.SerializerMethodField(read_only=True)
    skills_required = SkillSerializer(many=True, read_only=True)
    skills_required_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), write_only=True, source="skills_required"
    )
    certificates_preferred = CertificateSerializer(many=True, read_only=True)
    certificates_preferred_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Certificate.objects.all(), write_only=True, source="certificates_preferred", required=False
    )
    courses_preferred = DegreeSerializer(many=True, read_only=True)
    courses_preferred_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Degree.objects.all(), write_only=True, source="courses_preferred", required=False
    )
    
    # Display fields for choices
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    work_type_display = serializers.CharField(source='get_work_type_display', read_only=True)
    experience_level_display = serializers.CharField(source='get_experience_level_display', read_only=True)
    
    # Additional computed fields
    salary_range = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "title", "description", "company", "company_name", "company_logo",
            "location", "employment_type", "employment_type_display", 
            "work_type", "work_type_display", "experience_level", "experience_level_display",
            "min_salary", "max_salary", "salary_range", "closing_date", "is_active",
            "skills_required", "skills_required_ids", 
            "certificates_preferred", "certificates_preferred_ids",
            "courses_preferred", "courses_preferred_ids",
            "created_at", "updated_at", "created_by"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by", "company_name", "company_logo"]

    def get_company_logo(self, obj):
        if obj.company.logo and hasattr(obj.company.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company.logo.url)
            return obj.company.logo.url
        return None

    def get_salary_range(self, obj):
        if obj.min_salary and obj.max_salary:
            return f"${obj.min_salary:,} - ${obj.max_salary:,}"
        return None

class JobCreateSerializer(serializers.ModelSerializer):
    skills_required_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), write_only=True, source="skills_required", required=False
    )
    certificates_preferred_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Certificate.objects.all(), write_only=True, source="certificates_preferred", required=False
    )
    courses_preferred_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Degree.objects.all(), write_only=True, source="courses_preferred", required=False
    )

    class Meta:
        model = Job
        fields = [
            "title", "description", "location", "employment_type", "work_type",
            "experience_level", "min_salary", "max_salary", "closing_date",
            "skills_required_ids", "certificates_preferred_ids", "courses_preferred_ids"
        ]

class JobListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_logo = serializers.SerializerMethodField(read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    work_type_display = serializers.CharField(source='get_work_type_display', read_only=True)
    salary_range = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "title", "company_name", "company_logo", "location",
            "employment_type_display", "work_type_display", "salary_range",
            "closing_date", "is_active", "created_at"
        ]

    def get_company_logo(self, obj):
        if obj.company.logo and hasattr(obj.company.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company.logo.url)
            return obj.company.logo.url
        return None

    def get_salary_range(self, obj):
        if obj.min_salary and obj.max_salary:
            return f"${obj.min_salary:,} - ${obj.max_salary:,}"
        return None