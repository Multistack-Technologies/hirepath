# backend/resumes/serializers.py
from rest_framework import serializers
from .models import Resume, CVAnalysis, JobMatch, SAJobMarketData

class ResumeUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    job_role = serializers.CharField(required=False, default="Junior Developer")
    preferred_locations = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=["Johannesburg", "Cape Town", "Pretoria"]
    )
    salary_expectation = serializers.IntegerField(required=False, min_value=0)

class CVAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVAnalysis
        fields = '__all__'

class JobMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobMatch
        fields = '__all__'

class ResumeFeedbackSerializer(serializers.ModelSerializer):
    cv_analysis = CVAnalysisSerializer(read_only=True, required=False)
    job_matches = JobMatchSerializer(many=True, read_only=True, required=False)
    market_insights = serializers.SerializerMethodField()
    improvement_recommendations = serializers.SerializerMethodField()
    
    class Meta:
        model = Resume
        fields = [
            'id', 'score', 'skills_detected', 'missing_skills', 'feedback', 
            'job_role_matched', 'uploaded_at', 'cv_analysis', 'job_matches',
            'market_insights', 'improvement_recommendations', 'analysis_data'
        ]
        read_only_fields = fields

    def get_market_insights(self, obj):
        # Use analysis_data if cv_analysis doesn't exist
        analysis_data = obj.analysis_data or {}
        market_fit = analysis_data.get('market_fit', {})
        
        return {
            'high_demand_skills': self.get_high_demand_skills(),
            'salary_benchmarks': self.get_salary_benchmarks(obj.job_role_matched),
            'growth_areas': ['FinTech', 'E-commerce', 'Cloud Services'],
            'top_companies_hiring': self.get_top_companies(obj.job_role_matched),
            'skills_demand_score': market_fit.get('skills_demand_score', 0),
            'market_score': market_fit.get('market_score', 0)
        }

    def get_improvement_recommendations(self, obj):
        # Use analysis_data if cv_analysis doesn't exist
        analysis_data = obj.analysis_data or {}
        recommendations_data = analysis_data.get('improvement_recommendations', [])
        
        if recommendations_data:
            return recommendations_data
        
        # Fallback recommendations based on basic analysis
        recommendations = []
        
        # Skills recommendations
        missing_skills = obj.missing_skills or []
        if missing_skills:
            recommendations.append({
                'type': 'skill_development',
                'priority': 'high',
                'message': f'Focus on high-demand skills: {", ".join(missing_skills[:2])}',
                'actions': [
                    'Take online courses on Coursera or Udemy',
                    'Build projects using these technologies'
                ]
            })
        
        # Score-based recommendations
        if obj.score and obj.score < 70:
            recommendations.append({
                'type': 'general_improvement',
                'priority': 'medium',
                'message': 'Your resume could be improved for better job matching',
                'actions': [
                    'Add more quantifiable achievements',
                    'Improve skills section with relevant technologies'
                ]
            })
        
        return recommendations

    def get_high_demand_skills(self):
        return ["Python", "React", "AWS", "Docker", "Machine Learning"]

    def get_salary_benchmarks(self, job_role):
        # Mock data - in production, fetch from database
        benchmarks = {
            "Junior Developer": {"min": 20000, "max": 40000, "median": 28000},
            "Senior Developer": {"min": 45000, "max": 85000, "median": 60000},
            "Data Analyst": {"min": 25000, "max": 50000, "median": 35000},
        }
        return benchmarks.get(job_role, {"min": 20000, "max": 40000, "median": 28000})

    def get_top_companies(self, job_role):
        sa_companies = [
            "Takealot", "Amazon Web Services (SA)", "Microsoft SA", "IBM South Africa",
            "Dimension Data", "Vodacom", "MTN", "Standard Bank", "FNB", "Investec"
        ]
        return sa_companies[:5]