from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, profile, ping, update_skills
from .views import CustomTokenObtainPairView

urlpatterns = [
    path("ping/", ping, name="accounts-ping"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("skills/", update_skills, name="update-skills"),
    path("profile/", profile, name="profile"),
]
