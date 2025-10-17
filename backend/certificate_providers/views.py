from rest_framework import generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import CertificateProvider
from .serializers import CertificateProviderSerializer, CertificateProviderListSerializer

class CertificateProviderListView(generics.ListAPIView):
    queryset = CertificateProvider.objects.all()
    serializer_class = CertificateProviderListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'issuer_name', 'description']
    filterset_fields = ['issuer_type', 'is_popular']
    ordering_fields = ['name', 'issuer_name', 'created_at']
    ordering = ['name']

class CertificateProviderDetailView(generics.RetrieveAPIView):
    queryset = CertificateProvider.objects.all()
    serializer_class = CertificateProviderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CertificateProviderCreateView(generics.CreateAPIView):
    queryset = CertificateProvider.objects.all()
    serializer_class = CertificateProviderSerializer
    permission_classes = [permissions.IsAdminUser]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def provider_search(request):
    """Search certificate providers by name"""
    search_query = request.GET.get('q', '')
    
    if search_query:
        providers = CertificateProvider.objects.filter(name__icontains=search_query)[:10]
    else:
        providers = CertificateProvider.objects.none()
    
    serializer = CertificateProviderListSerializer(providers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def popular_providers(request):
    """Get popular certificate providers"""
    providers = CertificateProvider.objects.filter(is_popular=True)
    serializer = CertificateProviderListSerializer(providers, many=True)
    return Response(serializer.data)