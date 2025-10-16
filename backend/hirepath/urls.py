from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("jobs/", include("jobs.urls")),
    path("resumes/", include("resumes.urls")),
    path("matching/", include("matching.urls")),
    path("companies/", include("companies.urls")),
    path("skills/", include("skills.urls")),
    path("applications/", include("applications.urls")),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
