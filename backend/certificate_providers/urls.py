from django.urls import path
from .views import (
    CertificateProviderListView,
    CertificateProviderDetailView,
    CertificateProviderCreateView,
    provider_search,
    popular_providers
)

urlpatterns = [
    path('', CertificateProviderListView.as_view(), name='provider-list'),
    path('create/', CertificateProviderCreateView.as_view(), name='provider-create'),
    path('search/', provider_search, name='provider-search'),
    path('popular/', popular_providers, name='popular-providers'),
    path('<int:pk>/', CertificateProviderDetailView.as_view(), name='provider-detail'),
]