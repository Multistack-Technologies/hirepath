from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from .models import Application
from .serializers import ApplicationSerializer

# Graduate applies to job
class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

# Graduate views their applications
class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user)

# Recruiter views applications for their jobs
class JobApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(job__company__created_by=self.request.user)
