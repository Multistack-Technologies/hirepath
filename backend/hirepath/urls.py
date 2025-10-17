from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="HirePath API",
        default_version='v1',
        description="HirePath - Job matching platform API documentation",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@hirepath.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)
urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("jobs/", include("jobs.urls")),
    path("resumes/", include("resumes.urls")),
    path("matching/", include("matching.urls")),
    path("companies/", include("companies.urls")),
    path("skills/", include("skills.urls")),
    path("applications/", include("applications.urls")),
    path('universities/', include('universities.urls')),
    path('degrees/', include('degrees.urls')),
    path('education/', include('education.urls')),
    path('certificate-providers/', include('certificate_providers.urls')),
    path('certificates/', include('certificates.urls')),
    path('job_roles/', include('job_roles.urls')),
    path('work-experience/', include('work_experience.urls')),
    path('analytics/', include('analytics.urls')),

       # Swagger URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)