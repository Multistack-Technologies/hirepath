from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/jobs/", include("jobs.urls")),
    path("api/resumes/", include("resumes.urls")),
    path("api/matching/", include("matching.urls")),
    path("api/companies/", include("companies.urls")),
    path("api/skills/", include("skills.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
