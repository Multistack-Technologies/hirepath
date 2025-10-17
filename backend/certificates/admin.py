from django.contrib import admin
from .models import Certificate

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'get_provider_name', 'get_issuer_name', 
        'issue_date', 'expiration_date', 'is_verified', 'status'
    ]
    list_filter = ['status', 'is_verified', 'issue_date', 'created_at']
    search_fields = [
        'user__username', 'provider__name', 'provider__issuer_name', 
        'credential_id'
    ]
    raw_id_fields = ['user', 'provider']
    date_hierarchy = 'issue_date'
    
    def get_provider_name(self, obj):
        return obj.provider.name
    get_provider_name.short_description = 'Certificate Name'
    get_provider_name.admin_order_field = 'provider__name'
    
    def get_issuer_name(self, obj):
        return obj.provider.issuer_name
    get_issuer_name.short_description = 'Issuer Name'
    get_issuer_name.admin_order_field = 'provider__issuer_name'