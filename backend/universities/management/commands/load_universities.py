from django.core.management.base import BaseCommand
from universities.models import University

class Command(BaseCommand):
    help = 'Load sample universities'

    def handle(self, *args, **options):
        universities = [
            # International Universities
            "Harvard University",
            "Stanford University",
            "MIT",
            "University of Cambridge",
            "University of Oxford",
            "California Institute of Technology",
            "Princeton University",
            "Yale University",
            "Columbia University",
            "University of Chicago",
            "University of California, Berkeley",
            "University of Michigan",
            "University of Toronto",
            "University of Melbourne",
            "National University of Singapore",
            
            # South African Universities
            "University of Cape Town",
            "University of the Witwatersrand",
            "Stellenbosch University",
            "University of Pretoria",
            "University of KwaZulu-Natal",
            "University of Johannesburg",
            "North-West University",
            "University of the Western Cape",
            "Rhodes University",
            "University of the Free State",
            "Nelson Mandela University",
            "University of Limpopo",
            "University of Venda",
            "University of Fort Hare",
            "University of Zululand",
            "Sefako Makgatho Health Sciences University",
            "Walter Sisulu University",
            "Cape Peninsula University of Technology",
            "Tshwane University of Technology",
            "Durban University of Technology",
            "Vaal University of Technology",
            "Central University of Technology",
            "Mangosuthu University of Technology",
            "University of South Africa",
        ]
        
        for name in universities:
            University.objects.get_or_create(name=name)
        
        self.stdout.write(self.style.SUCCESS('Successfully loaded sample universities'))