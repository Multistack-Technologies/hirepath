from django.urls import path
from .views import CompanyCreateView, my_company, update_company, company_industries

urlpatterns = [
    path("create/", CompanyCreateView.as_view(), name="company-create"),
    path("me/", my_company, name="my-company"),
    path("me/update/", update_company, name="update-company"),
    path("industries/", company_industries, name="company-industries"),
]