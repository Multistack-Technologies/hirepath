from rest_framework import serializers
from certificate_providers.models import CertificateProvider
from certificate_providers.serializers import CertificateProviderSerializer
from skills.models import Skill
from skills.serializers import SkillSerializer
from degrees.models import Degree
from degrees.serializers import DegreeSerializer
from companies.serializers import CompanySerializer
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_logo = serializers.SerializerMethodField(read_only=True)
    skills_required = SkillSerializer(many=True, read_only=True)
    skills_required_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), write_only=True, source="skills_required", required=False
    )
    certificates_preferred = CertificateProviderSerializer(many=True, read_only=True)
    certificates_preferred_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CertificateProvider.objects.all(), write_only=True, source="certificates_preferred", required=False
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
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id", "title", "description", "company", "company_name", "company_logo",
            "location", "employment_type", "employment_type_display", 
            "work_type", "work_type_display", "experience_level", "experience_level_display",
            "min_salary", "max_salary", "salary_range", "closing_date", "is_active", "days_remaining",
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
        elif obj.min_salary:
            return f"From ${obj.min_salary:,}"
        elif obj.max_salary:
            return f"Up to ${obj.max_salary:,}"
        return "Salary not specified"

    def get_days_remaining(self, obj):
        from datetime import date
        if obj.closing_date:
            today = date.today()
            remaining = (obj.closing_date - today).days
            return max(0, remaining)
        return None

    def validate(self, data):
        """
        Validate that min_salary is not greater than max_salary
        """
        min_salary = data.get('min_salary')
        max_salary = data.get('max_salary')
        
        if min_salary and max_salary and min_salary > max_salary:
            raise serializers.ValidationError({
                "min_salary": "Minimum salary cannot be greater than maximum salary."
            })
        
        return data

class JobCreateSerializer(serializers.ModelSerializer):
    skills_required_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), write_only=True, source="skills_required", required=False
    )
    certificates_preferred_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CertificateProvider.objects.all(), write_only=True, source="certificates_preferred", required=False
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

    def validate(self, data):
        """
        Validate that min_salary is not greater than max_salary
        """
        min_salary = data.get('min_salary')
        max_salary = data.get('max_salary')
        
        if min_salary and max_salary and min_salary > max_salary:
            raise serializers.ValidationError({
                "min_salary": "Minimum salary cannot be greater than maximum salary."
            })
        
        return data

class JobListSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_logo = serializers.SerializerMethodField(read_only=True)
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    work_type_display = serializers.CharField(source='get_work_type_display', read_only=True)
    experience_level_display = serializers.CharField(source='get_experience_level_display', read_only=True)
    salary_range = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.SerializerMethodField()
    skills_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id", "title", "company_name", "company_logo", "location",
            "employment_type_display", "work_type_display", "experience_level_display", 
            "salary_range", "closing_date", "is_active", "days_remaining", 
            "skills_count", "created_at"
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
        elif obj.min_salary:
            return f"From ${obj.min_salary:,}"
        elif obj.max_salary:
            return f"Up to ${obj.max_salary:,}"
        return "Salary not specified"

    def get_days_remaining(self, obj):
        from datetime import date
        if obj.closing_date:
            today = date.today()
            remaining = (obj.closing_date - today).days
            return max(0, remaining)
        return None

    def get_skills_count(self, obj):
        return obj.skills_required.count()