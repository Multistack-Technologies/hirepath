from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from skills.models import Skill
from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        user_data = UserSerializer(user).data

        return Response({
            "refresh": str(refresh),
            "access": str(access),
            **user_data
        })

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user profile data
        data["user"] = {
            "id": self.user.id,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "email": self.user.email,
            "role": self.user.role if hasattr(self.user, "role") else None,
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# keep your ping for testing
@api_view(["GET"])
def ping(request):
    return Response({"message": "accounts app is alive"})

@api_view(["PUT"])
@permission_classes([permissions.IsAuthenticated])
def update_skills(request):
    user = request.user
    skill_ids = request.data.get("skills", [])

    # Replace existing skills with new ones
    user.skills.set(Skill.objects.filter(id__in=skill_ids))
    user.save()

    return Response(UserSerializer(user).data)