
from django.db import models

class Degree(models.Model):
    NQF_LEVELS = [
        (5, 'NQF Level 5 - Higher Certificate'),
        (6, 'NQF Level 6 - Diploma & Advanced Certificate'),
        (7, 'NQF Level 7 - Bachelor\'s Degree & Advanced Diploma'),
        (8, 'NQF Level 8 - Honours Degree & Postgraduate Diploma'),
        (9, 'NQF Level 9 - Master\'s Degree'),
        (10, 'NQF Level 10 - Doctoral Degree'),
    ]
    
    name = models.CharField(max_length=255)
    nqf_level = models.IntegerField(choices=NQF_LEVELS)

    def __str__(self):
        return f"{self.name} (NQF {self.nqf_level})"

    class Meta:
        ordering = ['nqf_level', 'name']
        unique_together = ['name', 'nqf_level']