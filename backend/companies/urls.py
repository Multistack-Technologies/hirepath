from django.urls import path
from .views import CompanyCreateView, my_company

urlpatterns = [
    path("create/", CompanyCreateView.as_view(), name="company-create"),
    path("me/", my_company, name="my-company"),
]
