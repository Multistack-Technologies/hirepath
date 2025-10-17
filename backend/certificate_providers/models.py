from django.db import models

class CertificateProvider(models.Model):
    ISSUER_TYPES = [
        ('PLATFORM', 'Online Platform'),
        ('UNIVERSITY', 'University'),
        ('COMPANY', 'Company'),
        ('ORGANIZATION', 'Organization'),
        ('GOVERNMENT', 'Government'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    issuer_name = models.CharField(max_length=255)
    issuer_type = models.CharField(max_length=20, choices=ISSUER_TYPES, default='PLATFORM')
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Skills associated with this certificate
    skills = models.ManyToManyField('skills.Skill', blank=True, related_name='certificate_providers')
    
    # Metadata
    is_popular = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.issuer_name})"

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['issuer_name']),
            models.Index(fields=['is_popular']),
        ]