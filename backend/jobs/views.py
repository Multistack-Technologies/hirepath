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


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def ping(request):
    return Response({"message": "jobs app is alive"})
