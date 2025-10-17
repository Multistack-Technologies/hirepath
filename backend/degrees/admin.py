from django.contrib import admin
from .models import Degree

@admin.register(Degree)
class DegreeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'nqf_level', 'nqf_level_display']
    list_filter = ['nqf_level']
    search_fields = ['name']
    ordering = ['nqf_level', 'name']

    def nqf_level_display(self, obj):
        return obj.get_nqf_level_display()
    nqf_level_display.short_description = 'NQF Level'

