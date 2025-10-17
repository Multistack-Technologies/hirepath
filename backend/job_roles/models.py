from django.db import models

class JobRole(models.Model):
    CATEGORY_CHOICES = [
        ('DEVELOPMENT', 'Development'),
        ('DATA', 'Data & Analytics'),
        ('DEVOPS', 'DevOps & Cloud'),
        ('CYBERSECURITY', 'Cybersecurity'),
        ('PROJECT_MGMT', 'Project Management'),
        ('DESIGN', 'Design & UX'),
        ('TESTING', 'Testing & QA'),
        ('SUPPORT', 'IT Support'),
        ('NETWORKING', 'Networking'),
        ('DATABASE', 'Database'),
    ]
    
    title = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True, null=True)
    
    # Skills required for this job role
    skills = models.ManyToManyField('skills.Skill', blank=True, related_name='job_roles')
    
    # Job market data
    is_in_demand = models.BooleanField(default=False)
    remote_friendly = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['category', 'title']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['category']),
            models.Index(fields=['is_in_demand']),
        ]