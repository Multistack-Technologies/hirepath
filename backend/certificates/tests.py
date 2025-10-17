from rest_framework import serializers
from .models import Certificate, CertificateVerification
from skills.serializers import SkillSerializer

class CertificateVerificationSerializer(serializers.ModelSerializer):
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)

    class Meta:
        model = CertificateVerification
        fields = [
            'id', 'verified_by', 'verified_by_name', 'verified_at',
            'verification_method', 'notes'
        ]
        read_only_fields = ['verified_at']

class CertificateSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=models.Skill.objects.all(),
        source='skills',
        write_only=True,
        required=False
    )
    issuer_type_display = serializers.CharField(source='get_issuer_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    verification = CertificateVerificationSerializer(read_only=True)
    certificate_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'user', 'name', 'issuer_name', 'issuer_type', 'issuer_type_display',
            'certificate_url', 'credential_id', 'issue_date', 'expiration_date',
            'is_permanent', 'skills', 'skill_ids', 'verification_url', 'status',
            'status_display', 'description', 'hours_required', 'score',
            'certificate_file', 'certificate_file_url', 'is_verified', 'is_expired',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_expired', 'created_at', 'updated_at']

    def get_certificate_file_url(self, obj):
        if obj.certificate_file and hasattr(obj.certificate_file, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.certificate_file.url)
            return obj.certificate_file.url
        return None

    def validate(self, data):
        issue_date = data.get('issue_date')
        expiration_date = data.get('expiration_date')
        is_permanent = data.get('is_permanent', False)
        
        if expiration_date and issue_date and expiration_date < issue_date:
            raise serializers.ValidationError({
                "expiration_date": "Expiration date cannot be before issue date."
            })
        
        if is_permanent and expiration_date:
            raise serializers.ValidationError({
                "expiration_date": "Permanent certificates cannot have an expiration date."
            })
        
        return data

class CertificateCreateSerializer(serializers.ModelSerializer):
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=models.Skill.objects.all(),
        source='skills',
        required=False
    )

    class Meta:
        model = Certificate
        fields = [
            'name', 'issuer_name', 'issuer_type', 'certificate_url', 'credential_id',
            'issue_date', 'expiration_date', 'is_permanent', 'skill_ids',
            'verification_url', 'description', 'hours_required', 'score',
            'certificate_file'
        ]

class CertificateSummarySerializer(serializers.ModelSerializer):
    issuer_type_display = serializers.CharField(source='get_issuer_type_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'id', 'name', 'issuer_name', 'issuer_type_display',
            'issue_date', 'expiration_date', 'is_expired', 'is_verified'
        ]