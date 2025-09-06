from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Company
from .serializers import CompanySerializer

class CompanyCreateView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def my_company(request):
    company = getattr(request.user, "company", None)
    if not company:
        return Response({"error": "You don't have a company yet"}, status=404)
    return Response(CompanySerializer(company).data)
