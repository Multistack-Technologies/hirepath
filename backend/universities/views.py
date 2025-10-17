from rest_framework import generics, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import University
from .serializers import UniversitySerializer

class UniversityListView(generics.ListAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None

class UniversityCreateView(generics.CreateAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [permissions.IsAdminUser]

@api_view(['GET'])
def university_search(request):
    """Search universities by name"""
    search_query = request.GET.get('q', '')
    
    if search_query:
        universities = University.objects.filter(name__icontains=search_query)[:10]
    else:
        universities = University.objects.none()
    
    serializer = UniversitySerializer(universities, many=True)
    return Response(serializer.data)