from rest_framework import serializers
from .models import Certificate
from certificate_providers.models import CertificateProvider
from certificate_providers.serializers import CertificateProviderSerializer

class CertificateSerializer(serializers.ModelSerializer):
    provider = CertificateProviderSerializer(read_only=True)
    provider_id = serializers.PrimaryKeyRelatedField(
        queryset=CertificateProvider.objects.all(),
        source='provider',
        write_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    certificate_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'user', 'provider', 'provider_id', 'credential_id', 'certificate_url',
            'issue_date', 'expiration_date', 'is_permanent', 'certificate_file',
            'certificate_file_url', 'status', 'status_display', 'score', 'notes',
            'is_verified', 'is_expired', 'created_at', 'updated_at'
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
    provider_id = serializers.PrimaryKeyRelatedField(
        queryset=CertificateProvider.objects.all(),
        source='provider'
    )

    class Meta:
        model = Certificate
        fields = [
            'provider_id', 'credential_id', 'certificate_url', 'issue_date',
            'expiration_date', 'is_permanent', 'certificate_file', 'score', 'notes'
        ]

class CertificateSummarySerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.name')
    issuer_name = serializers.CharField(source='provider.issuer_name')
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'id', 'provider_name', 'issuer_name', 'issue_date', 
            'expiration_date', 'is_expired', 'is_verified'
        ]