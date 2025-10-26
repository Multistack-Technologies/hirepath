# backend/applications/serializers.py
from rest_framework import serializers
from .models import Application
from accounts.serializers import UserSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source="applicant.get_full_name", read_only=True)
    applicant_email = serializers.CharField(source="applicant.email", read_only=True)
    applicant_details = serializers.SerializerMethodField(read_only=True)
    
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company.name", read_only=True)
    company_logo = serializers.SerializerMethodField(read_only=True)
    
    match_score = serializers.SerializerMethodField()
    match_details = serializers.SerializerMethodField()
    
    can_withdraw = serializers.SerializerMethodField(read_only=True)
    ai_analysis = serializers.SerializerMethodField(read_only=True)
    ai_feedback = serializers.SerializerMethodField(read_only=True)
    is_highly_matched = serializers.BooleanField(read_only=True)
    needs_improvement = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    status_timeline = serializers.SerializerMethodField(read_only=True)
   
    class Meta:
        model = Application
        fields = [
            "id", "job", "job_title", "company_name", "company_logo",
            "applicant", "applicant_name", "applicant_email", "applicant_details",
            "cover_letter", "status", "applied_at", "updated_at", 
            "match_score", "match_details", "notes", "interview_date",
            "can_withdraw", "ai_analysis", "ai_feedback", "is_highly_matched",
            "needs_improvement", "is_active", "status_timeline"
        ]
        read_only_fields = [
            "id", "status", "applied_at", "updated_at", "applicant_name", 
            "applicant_email", "job_title", "company_name", "company_logo",
            "applicant", "match_score", "match_details", "can_withdraw",
            "ai_analysis", "ai_feedback", "is_highly_matched", "needs_improvement",
            "is_active", "status_timeline"
        ]

    def get_match_score(self, obj):
        try:
            if obj.match_score is None:
                obj.match_score = obj.calculate_match_score()
                obj.save()
            return obj.match_score or 0
        except Exception:
            return 0

    def get_match_details(self, obj):
        try:
            return obj.calculate_match_details()
        except Exception:
            return {
                "skills_matched": [],
                "skills_missing": [],
                "feedback": ["Error calculating match details"]
            }

    def get_company_logo(self, obj):
        try:
            if obj.job.company.logo and hasattr(obj.job.company.logo, 'url'):
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.job.company.logo.url)
                return obj.job.company.logo.url
            return None
        except Exception:
            return None

    def get_applicant_details(self, obj):
        """Return essential applicant details for recruiters"""
        try:
            return {
                "location": obj.applicant.location or "Not specified",
                "bio": obj.applicant.bio or "",
                "linkedin_url": obj.applicant.linkedin_url or "",
                "current_job_title": obj.applicant.job_title or "Not specified"
            }
        except Exception:
            return {
                "location": "Not specified",
                "bio": "",
                "linkedin_url": "",
                "current_job_title": "Not specified"
            }

    def get_can_withdraw(self, obj):
        """Check if application can be withdrawn"""
        try:
            return obj.can_withdraw()
        except Exception:
            return False

    def get_ai_analysis(self, obj):
        """Return AI analysis data"""
        try:
            return obj.ai_analysis or {}
        except Exception:
            return {}

    def get_ai_feedback(self, obj):
        """Return AI feedback"""
        try:
            return obj.ai_feedback or "No AI feedback available yet"
        except Exception:
            return "Error retrieving AI feedback"

    def get_status_timeline(self, obj):
        """Get application status timeline"""
        try:
            return obj.get_status_timeline()
        except Exception:
            return {
                'applied': obj.applied_at,
                'last_updated': obj.updated_at,
                'interview_scheduled': obj.interview_date
            }

class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status', 'notes', 'interview_date']

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['job', 'cover_letter']

class ApplicationAIAnalysisSerializer(serializers.ModelSerializer):
    """Serializer specifically for AI analysis results"""
    match_breakdown = serializers.SerializerMethodField()
    improvement_suggestions = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = [
            'match_score', 'ai_analysis', 'ai_feedback', 
            'match_breakdown', 'improvement_suggestions'
        ]
        read_only_fields = fields

    def get_match_breakdown(self, obj):
        """Extract match breakdown from AI analysis"""
        try:
            if obj.ai_analysis and 'breakdown' in obj.ai_analysis:
                return obj.ai_analysis['breakdown']
            return {}
        except Exception:
            return {}

    def get_improvement_suggestions(self, obj):
        """Extract improvement suggestions from AI analysis"""
        try:
            if obj.ai_analysis and 'suggestions' in obj.ai_analysis:
                return obj.ai_analysis['suggestions']
            return []
        except Exception:
            return []