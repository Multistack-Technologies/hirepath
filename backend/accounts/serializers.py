from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from job_roles.serializers import JobRoleSerializer
from education.serializers import EducationSerializer
from skills.serializers import SkillSerializer
from skills.models import Skill

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    target_job_roles = JobRoleSerializer(many=True, read_only=True)
    current_job_role = JobRoleSerializer(read_only=True)
    educations = serializers.SerializerMethodField()
    certificates = serializers.SerializerMethodField()
    work_experiences = serializers.SerializerMethodField() 
    avatarUrl = serializers.SerializerMethodField()
    phone = serializers.CharField(source='phone_number', allow_null=True, read_only=True)
    avatar = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "role", 
            "skills", "target_job_roles", "current_job_role", "educations", "certificates","work_experiences",
            "linkedin_url", "phone_number", "phone", "location", "avatarUrl", "avatar",
            "bio", "job_title", "date_joined", "last_login"
        ]
        read_only_fields = ['date_joined', 'last_login']
        extra_kwargs = {
            'avatar': {'write_only': True}
        }

    def get_avatarUrl(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def get_educations(self, obj):
        from education.serializers import EducationSerializer
        educations = obj.educations.all()
        return EducationSerializer(educations, many=True, context=self.context).data

    def get_certificates(self, obj):
        from certificates.serializers import CertificateSerializer
        certificates = obj.certificates.all()
        return CertificateSerializer(certificates, many=True, context=self.context).data
    
    def get_work_experiences(self, obj):
        from work_experience.serializers import WorkExperienceSerializer
        work_experiences = obj.work_experiences.all()
        return WorkExperienceSerializer(work_experiences, many=True, context=self.context).data
    

class UserProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    target_job_roles = JobRoleSerializer(many=True, read_only=True)
    current_job_role = JobRoleSerializer(read_only=True)
    avatarUrl = serializers.SerializerMethodField()
    phone = serializers.CharField(source='phone_number', allow_null=True, read_only=True)
    avatar = serializers.ImageField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'skills', 'target_job_roles', 'current_job_role',
            'date_joined', 'last_login', 'linkedin_url', 'phone_number', 
            'phone', 'location', 'avatarUrl', 'avatar', 'bio', 'job_title'
        ]
        read_only_fields = ['id', 'username', 'email', 'date_joined', 'last_login']
        extra_kwargs = {
            'avatar': {'write_only': True}
        }

    def get_avatarUrl(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def update(self, instance, validated_data):
        avatar = validated_data.pop('avatar', None)
        instance = super().update(instance, validated_data)
        if avatar is not None:
            instance.avatar = avatar
            instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    skills = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), required=False
    )
    phone = serializers.CharField(source='phone_number', required=False, allow_null=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "first_name", "last_name", "password", "password2", 
            "role", "skills", "linkedin_url", "phone_number", "phone", "location",
            "bio", "job_title", "avatar"
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Handle phone field mapping
        if 'phone' in attrs:
            attrs['phone_number'] = attrs.pop('phone')
            
        return attrs

    def create(self, validated_data):
        skills = validated_data.pop("skills", [])
        avatar = validated_data.pop("avatar", None)
        validated_data.pop("password2")
        
        # Handle phone field if present
        if 'phone' in validated_data:
            validated_data['phone_number'] = validated_data.pop('phone')
        
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            role=validated_data["role"],
            linkedin_url=validated_data.get("linkedin_url"),
            phone_number=validated_data.get("phone_number"),
            location=validated_data.get("location"),
            bio=validated_data.get("bio"),
            job_title=validated_data.get("job_title"),
            avatar=avatar,
        )
        user.skills.set(skills)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user profile data
        request = self.context.get('request')
        avatar_url = None
        if self.user.avatar and hasattr(self.user.avatar, 'url'):
            if request:
                avatar_url = request.build_absolute_uri(self.user.avatar.url)
            else:
                avatar_url = self.user.avatar.url

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "email": self.user.email,
            "role": self.user.role,
            "linkedin_url": self.user.linkedin_url,
            "phone_number": self.user.phone_number,
            "phone": self.user.phone_number,
            "location": self.user.location,
            "avatarUrl": avatar_url,
            "bio": self.user.bio,
            "job_title": self.user.job_title,
        }
        return data