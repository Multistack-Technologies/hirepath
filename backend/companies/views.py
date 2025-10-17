from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Company
from .serializers import CompanySerializer, CompanyCreateSerializer

class CompanyCreateView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def my_company(request):
    company = getattr(request.user, "company", None)
    if not company:
        return Response({"error": "You don't have a company yet"}, status=404)
    return Response(CompanySerializer(company, context={'request': request}).data)

@api_view(["PUT", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def update_company(request):
    company = getattr(request.user, "company", None)
    if not company:
        return Response({"error": "You don't have a company yet"}, status=404)
    
    serializer = CompanyCreateSerializer(
        company, 
        data=request.data, 
        partial=True,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(CompanySerializer(company, context={'request': request}).data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def company_industries(request):
    """Get list of available industries"""
    industries = dict(Company.INDUSTRY_CHOICES)
    return Response(industries)