from django.urls import path
from .views import UniversityListView, UniversityCreateView, university_search

urlpatterns = [
    path('', UniversityListView.as_view(), name='university-list'),
    path('create/', UniversityCreateView.as_view(), name='university-create'),
    path('search/', university_search, name='university-search'),
]