from rest_framework import serializers
from .models import Degree

class DegreeSerializer(serializers.ModelSerializer):
    nqf_level_display = serializers.CharField(source='get_nqf_level_display', read_only=True)

    class Meta:
        model = Degree
        fields = ['id', 'name', 'nqf_level', 'nqf_level_display']