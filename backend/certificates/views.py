from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Certificate
from .serializers import (
    CertificateSerializer, CertificateCreateSerializer,
    CertificateSummarySerializer
)

class CertificateListCreateView(generics.ListCreateAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user).select_related('provider')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CertificateCreateSerializer
        return CertificateSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CertificateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user).select_related('provider')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CertificateCreateSerializer
        return CertificateSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_certificates(request):
    """Get all certificates for current user"""
    certificates = Certificate.objects.filter(user=request.user).select_related('provider')
    
    serializer = CertificateSerializer(certificates, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_certificate(request):
    """Create new certificate for current user"""
    serializer = CertificateCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                certificate = serializer.save(user=request.user)
                # Return full certificate data
                full_serializer = CertificateSerializer(certificate, context={'request': request})
                return Response(full_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def certificate_stats(request):
    """Get certificate statistics for current user"""
    certificates = Certificate.objects.filter(user=request.user)
    
    stats = {
        'total_certificates': certificates.count(),
        'active_certificates': certificates.filter(status='ACTIVE').count(),
        'expired_certificates': certificates.filter(status='EXPIRED').count(),
        'verified_certificates': certificates.filter(is_verified=True).count(),
        'permanent_certificates': certificates.filter(is_permanent=True).count(),
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def expiring_certificates(request):
    """Get certificates expiring soon (within 30 days)"""
    from datetime import timedelta
    thirty_days_from_now = timezone.now().date() + timedelta(days=30)
    
    certificates = Certificate.objects.filter(
        user=request.user,
        status='ACTIVE',
        expiration_date__isnull=False,
        expiration_date__lte=thirty_days_from_now,
        expiration_date__gte=timezone.now().date()
    ).select_related('provider')
    
    serializer = CertificateSummarySerializer(certificates, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def verify_certificate(request, certificate_id):
    """Admin endpoint to verify a certificate"""
    try:
        certificate = Certificate.objects.get(id=certificate_id)
    except Certificate.DoesNotExist:
        return Response(
            {'error': 'Certificate not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Mark certificate as verified
    certificate.is_verified = True
    certificate.save()
    
    return Response({
        'message': 'Certificate verified successfully',
        'certificate': CertificateSerializer(certificate).data
    })