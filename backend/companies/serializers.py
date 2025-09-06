from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "description", "website", "location", "created_by"]
        read_only_fields = ["id", "created_by"]

    # def create(self, validated_data):
    #     user = self.context["request"].user
    #     company = Company.objects.create(created_by=user, **validated_data)
    #     return company
