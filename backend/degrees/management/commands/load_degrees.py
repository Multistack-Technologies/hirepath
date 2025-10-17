from django.core.management.base import BaseCommand
from degrees.models import Degree

class Command(BaseCommand):
    help = 'Load sample degrees'

    def handle(self, *args, **options):
        degrees = [
            # NQF Level 5
            {'name': 'Higher Certificate in IT', 'nqf_level': 5},
            {'name': 'Higher Certificate in Computer Science', 'nqf_level': 5},
            {'name': 'Higher Certificate in Software Development', 'nqf_level': 5},
            
            # NQF Level 6
            {'name': 'Diploma in IT', 'nqf_level': 6},
            {'name': 'Diploma in Computer Science', 'nqf_level': 6},
            {'name': 'Diploma in Software Development', 'nqf_level': 6},
            {'name': 'Diploma in Network Engineering', 'nqf_level': 6},
            {'name': 'Diploma in Data Science', 'nqf_level': 6},
            
            # NQF Level 7
            {'name': 'Bachelor of Science in Computer Science', 'nqf_level': 7},
            {'name': 'Bachelor of Science in Information Technology', 'nqf_level': 7},
            {'name': 'Bachelor of Science in Software Engineering', 'nqf_level': 7},
            {'name': 'Bachelor of Science in Data Science', 'nqf_level': 7},
            {'name': 'Bachelor of Science in Cybersecurity', 'nqf_level': 7},
            {'name': 'Bachelor of Science in Artificial Intelligence', 'nqf_level': 7},
            {'name': 'Bachelor of Science in Information Systems', 'nqf_level': 7},
            {'name': 'Bachelor of Science in Computer Engineering', 'nqf_level': 7},
            
            # NQF Level 8
            {'name': 'BSc Honours in Computer Science', 'nqf_level': 8},
            {'name': 'BSc Honours in Information Technology', 'nqf_level': 8},
            {'name': 'BSc Honours in Software Engineering', 'nqf_level': 8},
            {'name': 'Postgraduate Diploma in Data Science', 'nqf_level': 8},
            {'name': 'Postgraduate Diploma in Cybersecurity', 'nqf_level': 8},
            {'name': 'Postgraduate Diploma in AI', 'nqf_level': 8},
            
            # NQF Level 9
            {'name': 'Master of Science in Computer Science', 'nqf_level': 9},
            {'name': 'Master of Science in Information Technology', 'nqf_level': 9},
            {'name': 'Master of Science in Software Engineering', 'nqf_level': 9},
            {'name': 'Master of Science in Data Science', 'nqf_level': 9},
            {'name': 'Master of Science in Cybersecurity', 'nqf_level': 9},
            {'name': 'Master of Science in Artificial Intelligence', 'nqf_level': 9},
            {'name': 'Master of Business Administration in IT', 'nqf_level': 9},
            
            # NQF Level 10
            {'name': 'Doctor of Philosophy in Computer Science', 'nqf_level': 10},
            {'name': 'Doctor of Philosophy in Information Technology', 'nqf_level': 10},
            {'name': 'Doctor of Philosophy in Software Engineering', 'nqf_level': 10},
            {'name': 'Doctor of Philosophy in Data Science', 'nqf_level': 10},
            {'name': 'Doctor of Philosophy in Artificial Intelligence', 'nqf_level': 10},
        ]
        
        for degree_data in degrees:
            Degree.objects.get_or_create(
                name=degree_data['name'],
                nqf_level=degree_data['nqf_level']
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully loaded IT degrees'))