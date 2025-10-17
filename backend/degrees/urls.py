from django.urls import path
from .views import DegreeListView, DegreeCreateView, degree_search, degrees_by_level

urlpatterns = [
    path('', DegreeListView.as_view(), name='degree-list'),
    path('create/', DegreeCreateView.as_view(), name='degree-create'),
    path('search/', degree_search, name='degree-search'),
    path('level/<int:nqf_level>/', degrees_by_level, name='degrees-by-level'),
]