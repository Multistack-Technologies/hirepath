from django.core.management.base import BaseCommand
from certificate_providers.models import CertificateProvider
from skills.models import Skill

class Command(BaseCommand):
    help = 'Load sample certificate providers'

    def handle(self, *args, **options):
        providers = [
            # Cloud & DevOps (12)
            {
                'name': 'AWS Solutions Architect Associate',
                'issuer_name': 'Amazon Web Services',
                'issuer_type': 'COMPANY',
                'description': 'Associate level certification for AWS cloud architecture',
                'website': 'https://aws.amazon.com/certification/',
                'is_popular': True,
                'skills': ['AWS', 'Cloud Architecture', 'EC2', 'S3', 'VPC']
            },
            {
                'name': 'AWS Developer Associate',
                'issuer_name': 'Amazon Web Services',
                'issuer_type': 'COMPANY',
                'description': 'Developer-focused AWS certification',
                'website': 'https://aws.amazon.com/certification/',
                'is_popular': True,
                'skills': ['AWS', 'Lambda', 'API Gateway', 'DynamoDB', 'Serverless']
            },
            {
                'name': 'AWS SysOps Administrator',
                'issuer_name': 'Amazon Web Services',
                'issuer_type': 'COMPANY',
                'description': 'Systems operations and administration on AWS',
                'website': 'https://aws.amazon.com/certification/',
                'is_popular': True,
                'skills': ['AWS', 'SysOps', 'Monitoring', 'Deployment']
            },
            {
                'name': 'Google Cloud Professional Architect',
                'issuer_name': 'Google Cloud',
                'issuer_type': 'COMPANY', 
                'description': 'Professional certification for Google Cloud architecture',
                'website': 'https://cloud.google.com/certification',
                'is_popular': True,
                'skills': ['Google Cloud', 'Cloud Architecture', 'Kubernetes']
            },
            {
                'name': 'Google Cloud Developer',
                'issuer_name': 'Google Cloud',
                'issuer_type': 'COMPANY',
                'description': 'Application development on Google Cloud Platform',
                'website': 'https://cloud.google.com/certification',
                'is_popular': True,
                'skills': ['Google Cloud', 'App Engine', 'Cloud Functions']
            },
            {
                'name': 'Microsoft Azure Solutions Architect',
                'issuer_name': 'Microsoft',
                'issuer_type': 'COMPANY',
                'description': 'Expert-level certification for Azure solutions',
                'website': 'https://docs.microsoft.com/en-us/learn/certifications/',
                'is_popular': True,
                'skills': ['Azure', 'Cloud Architecture', 'ARM Templates']
            },
            {
                'name': 'Microsoft Azure Developer',
                'issuer_name': 'Microsoft',
                'issuer_type': 'COMPANY',
                'description': 'Azure application development and deployment',
                'website': 'https://docs.microsoft.com/en-us/learn/certifications/',
                'is_popular': True,
                'skills': ['Azure', 'App Services', 'Functions', 'Storage']
            },
            {
                'name': 'Docker Certified Associate',
                'issuer_name': 'Docker',
                'issuer_type': 'COMPANY',
                'description': 'Containerization and Docker platform certification',
                'website': 'https://www.docker.com/',
                'is_popular': True,
                'skills': ['Docker', 'Containers', 'DevOps', 'CI/CD']
            },
            {
                'name': 'Kubernetes Administrator',
                'issuer_name': 'Cloud Native Computing Foundation',
                'issuer_type': 'ORGANIZATION',
                'description': 'Kubernetes cluster administration certification',
                'website': 'https://www.cncf.io/',
                'is_popular': True,
                'skills': ['Kubernetes', 'DevOps', 'Containers', 'Orchestration']
            },
            {
                'name': 'Terraform Associate',
                'issuer_name': 'HashiCorp',
                'issuer_type': 'COMPANY',
                'description': 'Infrastructure as Code with Terraform',
                'website': 'https://www.hashicorp.com/',
                'is_popular': True,
                'skills': ['Terraform', 'Infrastructure as Code', 'DevOps']
            },
            {
                'name': 'Jenkins Engineer',
                'issuer_name': 'CloudBees',
                'issuer_type': 'COMPANY',
                'description': 'CI/CD pipeline development with Jenkins',
                'website': 'https://www.cloudbees.com/',
                'is_popular': True,
                'skills': ['Jenkins', 'CI/CD', 'DevOps', 'Automation']
            },
            {
                'name': 'Red Hat Certified Engineer',
                'issuer_name': 'Red Hat',
                'issuer_type': 'COMPANY',
                'description': 'Linux system administration and engineering',
                'website': 'https://www.redhat.com/',
                'is_popular': True,
                'skills': ['Linux', 'System Administration', 'Red Hat']

            # Programming & Development (12)
            },
            {
                'name': 'Python Programming Certification',
                'issuer_name': 'Coursera',
                'issuer_type': 'PLATFORM',
                'description': 'University-level Python programming certification',
                'website': 'https://www.coursera.org',
                'is_popular': True,
                'skills': ['Python', 'Programming', 'Algorithms', 'Data Structures']
            },
            {
                'name': 'Java SE Programmer',
                'issuer_name': 'Oracle',
                'issuer_type': 'COMPANY',
                'description': 'Oracle Certified Professional Java SE Programmer',
                'website': 'https://education.oracle.com/',
                'is_popular': True,
                'skills': ['Java', 'OOP', 'Spring Framework', 'JVM']
            },
            {
                'name': 'Full Stack Web Development',
                'issuer_name': 'freeCodeCamp',
                'issuer_type': 'PLATFORM',
                'description': 'Comprehensive full-stack web development certification',
                'website': 'https://www.freecodecamp.org/',
                'is_popular': True,
                'skills': ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML/CSS']
            },
            {
                'name': 'React Developer Certification',
                'issuer_name': 'Meta',
                'issuer_type': 'COMPANY',
                'description': 'Professional React development certification',
                'website': 'https://www.meta.com/',
                'is_popular': True,
                'skills': ['React', 'JavaScript', 'Frontend', 'Redux', 'Hooks']
            },
            {
                'name': 'Node.js Services Developer',
                'issuer_name': 'OpenJS Foundation',
                'issuer_type': 'ORGANIZATION',
                'description': 'Node.js backend development certification',
                'website': 'https://openjsf.org/',
                'is_popular': True,
                'skills': ['Node.js', 'JavaScript', 'Backend', 'Express.js', 'API']
            },
            {
                'name': 'Angular Developer',
                'issuer_name': 'Google',
                'issuer_type': 'COMPANY',
                'description': 'Angular framework development certification',
                'website': 'https://angular.io/',
                'is_popular': True,
                'skills': ['Angular', 'TypeScript', 'Frontend', 'RxJS']
            },
            {
                'name': 'Vue.js Developer',
                'issuer_name': 'Vue School',
                'issuer_type': 'PLATFORM',
                'description': 'Vue.js framework development certification',
                'website': 'https://vueschool.io/',
                'is_popular': True,
                'skills': ['Vue.js', 'JavaScript', 'Frontend', 'Vuex']
            },
            {
                'name': 'Spring Professional',
                'issuer_name': 'VMware',
                'issuer_type': 'COMPANY',
                'description': 'Spring Framework and Spring Boot certification',
                'website': 'https://spring.io/',
                'is_popular': True,
                'skills': ['Spring', 'Java', 'Spring Boot', 'Microservices']
            },
            {
                'name': '.NET Developer',
                'issuer_name': 'Microsoft',
                'issuer_type': 'COMPANY',
                'description': '.NET framework development certification',
                'website': 'https://dotnet.microsoft.com/',
                'is_popular': True,
                'skills': ['.NET', 'C#', 'ASP.NET', 'Entity Framework']
            },
            {
                'name': 'Flutter Developer',
                'issuer_name': 'Google',
                'issuer_type': 'COMPANY',
                'description': 'Cross-platform mobile development with Flutter',
                'website': 'https://flutter.dev/',
                'is_popular': True,
                'skills': ['Flutter', 'Dart', 'Mobile Development', 'Cross-platform']
            },
            {
                'name': 'Swift Developer',
                'issuer_name': 'Apple',
                'issuer_type': 'COMPANY',
                'description': 'iOS and macOS development with Swift',
                'website': 'https://developer.apple.com/',
                'is_popular': True,
                'skills': ['Swift', 'iOS', 'Mobile Development', 'Xcode']
            },
            {
                'name': 'Kotlin Developer',
                'issuer_name': 'JetBrains',
                'issuer_type': 'COMPANY',
                'description': 'Android and backend development with Kotlin',
                'website': 'https://kotlinlang.org/',
                'is_popular': True,
                'skills': ['Kotlin', 'Android', 'Backend', 'Coroutines']
            },

            # Data Science & AI (10)
            {
                'name': 'Data Science Professional Certificate',
                'issuer_name': 'IBM',
                'issuer_type': 'COMPANY',
                'description': 'Comprehensive data science and machine learning certification',
                'website': 'https://www.ibm.com/training/',
                'is_popular': True,
                'skills': ['Data Science', 'Python', 'Machine Learning', 'Pandas', 'NumPy']
            },
            {
                'name': 'TensorFlow Developer Certificate',
                'issuer_name': 'Google',
                'issuer_type': 'COMPANY',
                'description': 'Machine learning and deep learning with TensorFlow',
                'website': 'https://www.tensorflow.org/',
                'is_popular': True,
                'skills': ['TensorFlow', 'Machine Learning', 'Deep Learning', 'Python', 'Keras']
            },
            {
                'name': 'PyTorch Developer',
                'issuer_name': 'Linux Foundation',
                'issuer_type': 'ORGANIZATION',
                'description': 'Deep learning with PyTorch framework',
                'website': 'https://www.linuxfoundation.org/',
                'is_popular': True,
                'skills': ['PyTorch', 'Deep Learning', 'Python', 'Neural Networks']
            },
            {
                'name': 'AWS Machine Learning Specialty',
                'issuer_name': 'Amazon Web Services',
                'issuer_type': 'COMPANY',
                'description': 'Machine learning on AWS platform',
                'website': 'https://aws.amazon.com/certification/',
                'is_popular': True,
                'skills': ['AWS', 'Machine Learning', 'SageMaker', 'Data Engineering']
            },
            {
                'name': 'Microsoft Azure AI Engineer',
                'issuer_name': 'Microsoft',
                'issuer_type': 'COMPANY',
                'description': 'AI and machine learning solutions on Azure',
                'website': 'https://azure.microsoft.com/',
                'is_popular': True,
                'skills': ['Azure', 'AI', 'Machine Learning', 'Cognitive Services']
            },
            {
                'name': 'Data Engineering on Google Cloud',
                'issuer_name': 'Google Cloud',
                'issuer_type': 'COMPANY',
                'description': 'Data engineering and processing on GCP',
                'website': 'https://cloud.google.com/certification',
                'is_popular': True,
                'skills': ['Google Cloud', 'Data Engineering', 'BigQuery', 'Dataflow']
            },
            {
                'name': 'Tableau Desktop Specialist',
                'issuer_name': 'Tableau',
                'issuer_type': 'COMPANY',
                'description': 'Data visualization and business intelligence',
                'website': 'https://www.tableau.com/',
                'is_popular': True,
                'skills': ['Tableau', 'Data Visualization', 'Business Intelligence', 'Dashboard']
            },
            {
                'name': 'Power BI Data Analyst',
                'issuer_name': 'Microsoft',
                'issuer_type': 'COMPANY',
                'description': 'Data analysis and visualization with Power BI',
                'website': 'https://powerbi.microsoft.com/',
                'is_popular': True,
                'skills': ['Power BI', 'Data Analysis', 'Visualization', 'DAX']
            },
            {
                'name': 'Apache Spark Developer',
                'issuer_name': 'Databricks',
                'issuer_type': 'COMPANY',
                'description': 'Big data processing with Apache Spark',
                'website': 'https://databricks.com/',
                'is_popular': True,
                'skills': ['Apache Spark', 'Big Data', 'Scala', 'Data Processing']
            },
            {
                'name': 'Natural Language Processing',
                'issuer_name': 'Coursera',
                'issuer_type': 'PLATFORM',
                'description': 'NLP and text processing certification',
                'website': 'https://www.coursera.org',
                'is_popular': True,
                'skills': ['NLP', 'Python', 'Text Processing', 'Machine Learning']
            },
            # Cybersecurity (8)
            {
                'name': 'Certified Ethical Hacker',
                'issuer_name': 'EC-Council',
                'issuer_type': 'ORGANIZATION',
                'description': 'Ethical hacking and penetration testing certification',
                'website': 'https://www.eccouncil.org/',
                'is_popular': True,
                'skills': ['Cybersecurity', 'Penetration Testing', 'Ethical Hacking', 'Kali Linux']
            },
            {
                'name': 'CompTIA Security+',
                'issuer_name': 'CompTIA',
                'issuer_type': 'ORGANIZATION',
                'description': 'Foundation-level cybersecurity certification',
                'website': 'https://www.comptia.org/',
                'is_popular': True,
                'skills': ['Cybersecurity', 'Network Security', 'Risk Management']
            },
            {
                'name': 'CISSP - Certified Information Systems Security Professional',
                'issuer_name': 'ISC2',
                'issuer_type': 'ORGANIZATION',
                'description': 'Advanced cybersecurity management certification',
                'website': 'https://www.isc2.org/',
                'is_popular': True,
                'skills': ['Cybersecurity', 'Risk Management', 'Security Architecture']
            },
            {
                'name': 'CISA - Certified Information Systems Auditor',
                'issuer_name': 'ISACA',
                'issuer_type': 'ORGANIZATION',
                'description': 'Information systems auditing and control',
                'website': 'https://www.isaca.org/',
                'is_popular': True,
                'skills': ['Auditing', 'Cybersecurity', 'Compliance', 'Risk Management']
            },
            {
                'name': 'CISM - Certified Information Security Manager',
                'issuer_name': 'ISACA',
                'issuer_type': 'ORGANIZATION',
                'description': 'Information security management and governance',
                'website': 'https://www.isaca.org/',
                'is_popular': True,
                'skills': ['Security Management', 'Governance', 'Risk Management']
            },
            {
                'name': 'CCSP - Certified Cloud Security Professional',
                'issuer_name': 'ISC2',
                'issuer_type': 'ORGANIZATION',
                'description': 'Cloud security architecture and operations',
                'website': 'https://www.isc2.org/',
                'is_popular': True,
                'skills': ['Cloud Security', 'AWS', 'Azure', 'Google Cloud']
            },
            {
                'name': 'OSCP - Offensive Security Certified Professional',
                'issuer_name': 'Offensive Security',
                'issuer_type': 'ORGANIZATION',
                'description': 'Hands-on penetration testing certification',
                'website': 'https://www.offensive-security.com/',
                'is_popular': True,
                'skills': ['Penetration Testing', 'Kali Linux', 'Exploitation', 'Metasploit']
            },
            {
                'name': 'GIAC Security Essentials',
                'issuer_name': 'SANS Institute',
                'issuer_type': 'ORGANIZATION',
                'description': 'Foundational cybersecurity skills certification',
                'website': 'https://www.sans.org/',
                'is_popular': True,
                'skills': ['Cybersecurity', 'Network Defense', 'Incident Response']
            },

            # Project Management & Agile (6)
            {
                'name': 'Project Management Professional',
                'issuer_name': 'Project Management Institute',
                'issuer_type': 'ORGANIZATION',
                'description': 'Global standard in project management certification',
                'website': 'https://www.pmi.org/',
                'is_popular': True,
                'skills': ['Project Management', 'Agile', 'Scrum', 'Risk Management']
            },
            {
                'name': 'Certified ScrumMaster',
                'issuer_name': 'Scrum Alliance',
                'issuer_type': 'ORGANIZATION',
                'description': 'Scrum framework and agile project management',
                'website': 'https://www.scrumalliance.org/',
                'is_popular': True,
                'skills': ['Scrum', 'Agile', 'Project Management', 'Team Leadership']
            },
            {
                'name': 'SAFe Agilist Certification',
                'issuer_name': 'Scaled Agile',
                'issuer_type': 'ORGANIZATION',
                'description': 'Enterprise-scale agile framework certification',
                'website': 'https://www.scaledagile.com/',
                'is_popular': True,
                'skills': ['SAFe', 'Agile', 'Enterprise Architecture', 'DevOps']
            },
            {
                'name': 'PRINCE2 Practitioner',
                'issuer_name': 'AXELOS',
                'issuer_type': 'ORGANIZATION',
                'description': 'Structured project management methodology',
                'website': 'https://www.axelos.com/',
                'is_popular': True,
                'skills': ['PRINCE2', 'Project Management', 'Methodology']
            },
            {
                'name': 'ITIL 4 Foundation',
                'issuer_name': 'AXELOS',
                'issuer_type': 'ORGANIZATION',
                'description': 'IT service management framework',
                'website': 'https://www.axelos.com/',
                'is_popular': True,
                'skills': ['ITIL', 'Service Management', 'IT Operations']
            },
            {
                'name': 'Lean Six Sigma Green Belt',
                'issuer_name': 'ASQ',
                'issuer_type': 'ORGANIZATION',
                'description': 'Process improvement and quality management',
                'website': 'https://asq.org/',
                'is_popular': True,
                'skills': ['Six Sigma', 'Process Improvement', 'Quality Management']
            },

            # Database & Data Management (6)
            {
                'name': 'MongoDB Certified Developer',
                'issuer_name': 'MongoDB',
                'issuer_type': 'COMPANY',
                'description': 'NoSQL database development with MongoDB',
                'website': 'https://www.mongodb.com/',
                'is_popular': True,
                'skills': ['MongoDB', 'NoSQL', 'Database', 'Backend Development']
            },
            {
                'name': 'Oracle Database Administrator',
                'issuer_name': 'Oracle',
                'issuer_type': 'COMPANY',
                'description': 'Oracle database administration and management',
                'website': 'https://education.oracle.com/',
                'is_popular': True,
                'skills': ['Oracle', 'SQL', 'Database Administration', 'Performance Tuning']
            },
            {
                'name': 'MySQL Database Administrator',
                'issuer_name': 'Oracle',
                'issuer_type': 'COMPANY',
                'description': 'MySQL database administration certification',
                'website': 'https://education.oracle.com/',
                'is_popular': True,
                'skills': ['MySQL', 'SQL', 'Database Administration']
            },
            {
                'name': 'PostgreSQL Administrator',
                'issuer_name': 'PostgreSQL',
                'issuer_type': 'ORGANIZATION',
                'description': 'PostgreSQL database administration',
                'website': 'https://www.postgresql.org/',
                'is_popular': True,
                'skills': ['PostgreSQL', 'SQL', 'Database Administration']
            },
            {
                'name': 'AWS Certified Database Specialty',
                'issuer_name': 'Amazon Web Services',
                'issuer_type': 'COMPANY',
                'description': 'Database services on AWS platform',
                'website': 'https://aws.amazon.com/certification/',
                'is_popular': True,
                'skills': ['AWS', 'Database', 'RDS', 'DynamoDB', 'Aurora']
            },
            {
                'name': 'Google Cloud Database Engineer',
                'issuer_name': 'Google Cloud',
                'issuer_type': 'COMPANY',
                'description': 'Database solutions on Google Cloud',
                'website': 'https://cloud.google.com/certification',
                'is_popular': True,
                'skills': ['Google Cloud', 'Database', 'Cloud SQL', 'Bigtable']
            },

            # Networking (6)
            {
                'name': 'Cisco CCNA',
                'issuer_name': 'Cisco',
                'issuer_type': 'COMPANY',
                'description': 'Cisco Certified Network Associate',
                'website': 'https://www.cisco.com/',
                'is_popular': True,
                'skills': ['Networking', 'Cisco', 'Routing', 'Switching']
            },
            {
                'name': 'CompTIA Network+',
                'issuer_name': 'CompTIA',
                'issuer_type': 'ORGANIZATION',
                'description': 'Foundation-level networking certification',
                'website': 'https://www.comptia.org/',
                'is_popular': True,
                'skills': ['Networking', 'TCP/IP', 'Network Security']
            },
            {
                'name': 'AWS Advanced Networking',
                'issuer_name': 'Amazon Web Services',
                'issuer_type': 'COMPANY',
                'description': 'Advanced networking on AWS platform',
                'website': 'https://aws.amazon.com/certification/',
                'is_popular': True,
                'skills': ['AWS', 'Networking', 'VPC', 'Route 53', 'Direct Connect']
            },
            {
                'name': 'Google Cloud Network Engineer',
                'issuer_name': 'Google Cloud',
                'issuer_type': 'COMPANY',
                'description': 'Networking solutions on Google Cloud',
                'website': 'https://cloud.google.com/certification',
                'is_popular': True,
                'skills': ['Google Cloud', 'Networking', 'VPC', 'Load Balancing']
            },
            {
                'name': 'Microsoft Azure Network Engineer',
                'issuer_name': 'Microsoft',
                'issuer_type': 'COMPANY',
                'description': 'Networking solutions on Azure',
                'website': 'https://azure.microsoft.com/',
                'is_popular': True,
                'skills': ['Azure', 'Networking', 'VPN', 'Load Balancer']
            },
            {
                'name': 'JNCIA-Junos',
                'issuer_name': 'Juniper Networks',
                'issuer_type': 'COMPANY',
                'description': 'Juniper Networks certification',
                'website': 'https://www.juniper.net/',
                'is_popular': True,
                'skills': ['Networking', 'Juniper', 'Routing', 'Switching']
            }
        ]
        
        for provider_data in providers:
            skills_data = provider_data.pop('skills')
            provider, created = CertificateProvider.objects.get_or_create(
                name=provider_data['name'],
                defaults=provider_data
            )
            
            # Add skills
            for skill_name in skills_data:
                skill, _ = Skill.objects.get_or_create(name=skill_name)
                provider.skills.add(skill)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {len(providers)} certificate providers'))