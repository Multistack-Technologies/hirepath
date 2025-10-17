from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Company(models.Model):
    INDUSTRY_CHOICES = [
        ('TECH', 'Technology'),
        ('FINANCE', 'Finance & Banking'),
        ('HEALTHCARE', 'Healthcare'),
        ('EDUCATION', 'Education'),
        ('RETAIL', 'Retail & E-commerce'),
        ('MANUFACTURING', 'Manufacturing'),
        ('CONSULTING', 'Consulting'),
        ('MEDIA', 'Media & Entertainment'),
        ('TELECOM', 'Telecommunications'),
        ('TRANSPORT', 'Transportation & Logistics'),
        ('REAL_ESTATE', 'Real Estate'),
        ('ENERGY', 'Energy & Utilities'),
        ('OTHER', 'Other'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255)
    
    # New fields
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES, default='TECH')
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    
    created_by = models.OneToOneField(User, on_delete=models.CASCADE, related_name="company")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ['name']