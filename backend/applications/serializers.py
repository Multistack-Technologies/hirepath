from rest_framework import serializers
from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source="applicant.get_full_name", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)

    class Meta:
        model = Application
        fields = ["id", "job", "job_title", "applicant", "applicant_name", "cover_letter", "status", "applied_at"]
        read_only_fields = ["id", "status", "applied_at", "applicant_name", "job_title", "applicant"]
