from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Certificate(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('REVOKED', 'Revoked'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    provider = models.ForeignKey('certificate_providers.CertificateProvider', on_delete=models.CASCADE, related_name='user_certificates')
    
    # Certificate instance details
    credential_id = models.CharField(max_length=255, blank=True, null=True, help_text="Certificate ID or Credential ID")
    certificate_url = models.URLField(blank=True, null=True)
    
    # Dates
    issue_date = models.DateField()
    expiration_date = models.DateField(blank=True, null=True)
    is_permanent = models.BooleanField(default=False)
    
    # File upload
    certificate_file = models.FileField(upload_to='certificates/', blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Additional info
    score = models.FloatField(
        blank=True, 
        null=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Score or percentage achieved"
    )
    notes = models.TextField(blank=True, null=True)
    
    # Metadata
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.provider.name}"

    @property
    def is_expired(self):
        if self.is_permanent or not self.expiration_date:
            return False
        from django.utils import timezone
        return self.expiration_date < timezone.now().date()

    def save(self, *args, **kwargs):
        # Auto-update status based on expiration
        if self.is_expired and self.status == 'ACTIVE':
            self.status = 'EXPIRED'
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-issue_date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['provider']),
            models.Index(fields=['issue_date']),
        ]