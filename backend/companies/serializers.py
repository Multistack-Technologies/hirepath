from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    industry_display = serializers.CharField(source='get_industry_display', read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            "id", "name", "description", "website", "location", 
            "email", "phone", "industry", "industry_display", "logo", "logo_url",
            "created_by", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def get_logo_url(self, obj):
        if obj.logo and hasattr(obj.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

class CompanyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "name", "description", "website", "location", 
            "email", "phone", "industry", "logo"
        ]