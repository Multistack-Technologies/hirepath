from django.urls import path
from .views import (
    CertificateListCreateView,
    CertificateDetailView,
    user_certificates,
    create_certificate,
    certificate_stats,
    expiring_certificates,
    verify_certificate
)

urlpatterns = [
    path('', CertificateListCreateView.as_view(), name='certificate-list-create'),
    path('user/', user_certificates, name='user-certificates'),
    path('create/', create_certificate, name='create-certificate'),
    path('stats/', certificate_stats, name='certificate-stats'),
    path('expiring/', expiring_certificates, name='expiring-certificates'),
    path('<int:certificate_id>/verify/', verify_certificate, name='verify-certificate'),
    path('<int:pk>/', CertificateDetailView.as_view(), name='certificate-detail'),
]