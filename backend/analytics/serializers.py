# analytics/serializers.py
from rest_framework import serializers
from .models import RecruitmentReport, DashboardView, AnalyticsExport

class RecruitmentReportSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(source='recruiter.get_full_name', read_only=True)
    report_period = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = RecruitmentReport
        fields = [
            'id', 'title', 'report_type', 'description', 'recruiter', 'recruiter_name',
            'date_range_start', 'date_range_end', 'filters_applied', 'report_data',
            'export_format', 'exported_file', 'file_url', 'is_exported',
            'generated_at', 'last_accessed', 'report_period'  # ADDED 'report_period'
        ]
        read_only_fields = ['id', 'recruiter', 'generated_at', 'last_accessed']
    
    def get_report_period(self, obj):
        return f"{obj.date_range_start} to {obj.date_range_end}"
    
    def get_file_url(self, obj):
        if obj.exported_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.exported_file.url)
        return None

class DashboardViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardView
        fields = ['id', 'name', 'widget_config', 'filters', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['id', 'recruiter', 'created_at', 'updated_at']

class AnalyticsExportSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = AnalyticsExport
        fields = [
            'id', 'export_type', 'filters', 'format', 'file', 'file_url',
            'status', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

class ReportGenerateSerializer(serializers.Serializer):
    report_type = serializers.ChoiceField(choices=RecruitmentReport.REPORT_TYPES)
    title = serializers.CharField(max_length=255)
    date_range_start = serializers.DateField()
    date_range_end = serializers.DateField()
    filters = serializers.JSONField(required=False, default=dict)
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        if data['date_range_start'] > data['date_range_end']:
            raise serializers.ValidationError("End date must be after start date")
        return data

class ExportRequestSerializer(serializers.Serializer):
    export_type = serializers.ChoiceField(choices=AnalyticsExport.EXPORT_TYPES)
    format = serializers.ChoiceField(choices=AnalyticsExport.FORMAT_CHOICES)
    filters = serializers.JSONField(required=False, default=dict)
    date_range_start = serializers.DateField(required=False)
    date_range_end = serializers.DateField(required=False)