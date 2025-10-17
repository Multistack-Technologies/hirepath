from django.contrib import admin
from .models import CertificateProvider

@admin.register(CertificateProvider)
class CertificateProviderAdmin(admin.ModelAdmin):
    list_display = ['name', 'issuer_name', 'issuer_type', 'is_popular', 'created_at']
    list_filter = ['issuer_type', 'is_popular', 'created_at']
    search_fields = ['name', 'issuer_name']
    filter_horizontal = ['skills']
    ordering = ['name']