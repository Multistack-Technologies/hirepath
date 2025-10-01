from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import  Job
from .serializers import  JobSerializer




class JobListCreateView(generics.ListCreateAPIView):
    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        # Ensure recruiter has a company
        if not hasattr(user, "company"):
            raise PermissionError("You must create a company profile before posting jobs.")
        serializer.save(created_by=user, company=user.company)


class MyJobListView(generics.ListAPIView):

    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
      
        user = self.request.user
        # Filter jobs where created_by is the current user
        return Job.objects.filter(created_by=user).order_by("-created_at")


class JobDetailView(generics.RetrieveAPIView):
  
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated] # Require auth to view details

    def get_queryset(self):
 
        user = self.request.user
        # Return jobs created by the current user
        return Job.objects.filter(created_by=user)

    def get_object(self):
  
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk']) # Use pk from URL
        # DRF's default permission checks (e.g., IsAuthenticated) happen after get_object
        # The queryset filtering above already restricts to jobs the user created
        return obj


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def ping(request):
    return Response({"message": "jobs app is alive"})
