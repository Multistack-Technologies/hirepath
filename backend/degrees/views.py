from rest_framework import generics, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Degree
from .serializers import DegreeSerializer

class DegreeListView(generics.ListAPIView):
    queryset = Degree.objects.all()
    serializer_class = DegreeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None

class DegreeCreateView(generics.CreateAPIView):
    queryset = Degree.objects.all()
    serializer_class = DegreeSerializer
    permission_classes = [permissions.IsAdminUser]

@api_view(['GET'])
def degree_search(request):
    """Search degrees by name"""
    search_query = request.GET.get('q', '')
    
    if search_query:
        degrees = Degree.objects.filter(name__icontains=search_query)[:10]
    else:
        degrees = Degree.objects.none()
    
    serializer = DegreeSerializer(degrees, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def degrees_by_level(request, nqf_level):
    """Get degrees by NQF level"""
    degrees = Degree.objects.filter(nqf_level=nqf_level)
    serializer = DegreeSerializer(degrees, many=True)
    return Response(serializer.data)