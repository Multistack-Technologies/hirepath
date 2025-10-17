from django.core.management.base import BaseCommand
from job_roles.models import JobRole
from skills.models import Skill

class Command(BaseCommand):
    help = 'Load sample job roles'

    def handle(self, *args, **options):
        job_roles = [
            # Development Roles
            {
                'title': 'Frontend Developer',
                'category': 'DEVELOPMENT',
                'description': 'Develops user-facing web applications using HTML, CSS, and JavaScript',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'Vue.js', 'Angular']
            },
            {
                'title': 'Backend Developer',
                'category': 'DEVELOPMENT',
                'description': 'Develops server-side logic and APIs for web applications',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Python', 'Node.js', 'Java', 'SQL', 'API Development', 'REST', 'GraphQL']
            },
            {
                'title': 'Full Stack Developer',
                'category': 'DEVELOPMENT',
                'description': 'Develops both frontend and backend components of web applications',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['JavaScript', 'React', 'Node.js', 'Python', 'Database', 'HTML/CSS', 'API']
            },
            {
                'title': 'Mobile App Developer',
                'category': 'DEVELOPMENT',
                'description': 'Develops applications for iOS and Android platforms',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Swift', 'Kotlin', 'Flutter', 'React Native', 'Mobile Development', 'iOS', 'Android']
            },
            {
                'title': 'Game Developer',
                'category': 'DEVELOPMENT',
                'description': 'Creates video games for various platforms and devices',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['C++', 'Unity', 'Unreal Engine', 'Game Development', '3D Graphics']
            },
            {
                'title': 'Embedded Systems Developer',
                'category': 'DEVELOPMENT',
                'description': 'Develops software for embedded systems and IoT devices',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['C', 'C++', 'Embedded Systems', 'Microcontrollers', 'IoT']
            },

            # DevOps & Cloud Roles
            {
                'title': 'DevOps Engineer',
                'category': 'DEVOPS',
                'description': 'Implements and manages CI/CD pipelines and infrastructure',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins', 'Ansible']
            },
            {
                'title': 'Cloud Engineer',
                'category': 'DEVOPS',
                'description': 'Designs and implements cloud infrastructure solutions',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['AWS', 'Azure', 'Google Cloud', 'Cloud Architecture', 'Infrastructure', 'Networking']
            },
            {
                'title': 'Site Reliability Engineer',
                'category': 'DEVOPS',
                'description': 'Ensures system reliability and performance through automation',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Monitoring', 'Automation', 'Linux', 'Scripting', 'Performance', 'Reliability']
            },
            {
                'title': 'Platform Engineer',
                'category': 'DEVOPS',
                'description': 'Builds and maintains internal developer platforms and tools',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Kubernetes', 'Docker', 'CI/CD', 'Automation', 'Developer Tools']
            },

            # Data & Analytics Roles
            {
                'title': 'Data Scientist',
                'category': 'DATA',
                'description': 'Analyzes complex data to extract insights and build predictive models',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Python', 'Machine Learning', 'Statistics', 'Data Analysis', 'SQL', 'Pandas', 'NumPy']
            },
            {
                'title': 'Data Engineer',
                'category': 'DATA',
                'description': 'Builds and maintains data pipelines and infrastructure',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Python', 'SQL', 'ETL', 'Big Data', 'Data Pipeline', 'Spark', 'Hadoop']
            },
            {
                'title': 'Machine Learning Engineer',
                'category': 'DATA',
                'description': 'Designs and implements machine learning systems and models',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'MLOps']
            },
            {
                'title': 'Data Analyst',
                'category': 'DATA',
                'description': 'Analyzes data to provide insights and support business decisions',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['SQL', 'Excel', 'Data Visualization', 'Statistics', 'Reporting', 'Tableau', 'Power BI']
            },
            {
                'title': 'Business Intelligence Analyst',
                'category': 'DATA',
                'description': 'Creates reports and dashboards for business decision-making',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['SQL', 'Power BI', 'Tableau', 'Data Visualization', 'Business Analysis']
            },
            {
                'title': 'Data Architect',
                'category': 'DATA',
                'description': 'Designs and manages organizational data architecture',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Data Modeling', 'SQL', 'Database Design', 'Data Governance', 'ETL']
            },

            # Cybersecurity Roles
            {
                'title': 'Cybersecurity Analyst',
                'category': 'CYBERSECURITY',
                'description': 'Monitors and protects systems from security threats',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Cybersecurity', 'Network Security', 'Risk Assessment', 'Incident Response', 'SIEM']
            },
            {
                'title': 'Security Engineer',
                'category': 'CYBERSECURITY',
                'description': 'Designs and implements security systems and protocols',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Security Architecture', 'Penetration Testing', 'Cryptography', 'Cloud Security', 'Firewalls']
            },
            {
                'title': 'Penetration Tester',
                'category': 'CYBERSECURITY',
                'description': 'Ethically hacks systems to identify vulnerabilities',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Penetration Testing', 'Ethical Hacking', 'Kali Linux', 'Vulnerability Assessment']
            },
            {
                'title': 'Security Operations Center Analyst',
                'category': 'CYBERSECURITY',
                'description': 'Monitors security alerts and responds to incidents',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['SIEM', 'Incident Response', 'Threat Detection', 'Security Monitoring']
            },

            # Project Management Roles
            {
                'title': 'Product Manager',
                'category': 'PROJECT_MGMT',
                'description': 'Defines product vision and manages product development lifecycle',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Product Management', 'Agile', 'Stakeholder Management', 'Roadmapping', 'User Stories']
            },
            {
                'title': 'Scrum Master',
                'category': 'PROJECT_MGMT',
                'description': 'Facilitates agile development processes and team collaboration',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Scrum', 'Agile', 'Team Facilitation', 'Project Management', 'Coaching']
            },
            {
                'title': 'Project Manager',
                'category': 'PROJECT_MGMT',
                'description': 'Manages project timelines, resources, and deliverables',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Project Management', 'Planning', 'Risk Management', 'Budgeting', 'Stakeholder Management']
            },
            {
                'title': 'Technical Program Manager',
                'category': 'PROJECT_MGMT',
                'description': 'Manages complex technical programs and cross-team initiatives',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Program Management', 'Technical Leadership', 'Cross-functional Coordination']
            },

            # Design & UX Roles
            {
                'title': 'UX/UI Designer',
                'category': 'DESIGN',
                'description': 'Designs user interfaces and experiences for digital products',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['UI Design', 'UX Research', 'Figma', 'Wireframing', 'Prototyping', 'User Testing']
            },
            {
                'title': 'Product Designer',
                'category': 'DESIGN',
                'description': 'Designs complete product experiences from concept to implementation',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Product Design', 'UX Research', 'Prototyping', 'Design Systems', 'User-Centered Design']
            },
            {
                'title': 'UX Researcher',
                'category': 'DESIGN',
                'description': 'Conducts user research to inform product design decisions',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['User Research', 'Usability Testing', 'Interviews', 'Surveys', 'Data Analysis']
            },
            {
                'title': 'Visual Designer',
                'category': 'DESIGN',
                'description': 'Creates visual elements and brand identity for digital products',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Visual Design', 'Branding', 'Typography', 'Color Theory', 'Adobe Creative Suite']
            },

            # Testing & QA Roles
            {
                'title': 'QA Engineer',
                'category': 'TESTING',
                'description': 'Tests software applications to ensure quality and functionality',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Testing', 'Automation', 'Selenium', 'Quality Assurance', 'Bug Tracking', 'Test Cases']
            },
            {
                'title': 'Test Automation Engineer',
                'category': 'TESTING',
                'description': 'Develops automated testing frameworks and scripts',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Test Automation', 'Selenium', 'Cypress', 'Python', 'Java', 'CI/CD']
            },
            {
                'title': 'Performance Test Engineer',
                'category': 'TESTING',
                'description': 'Tests application performance and scalability',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Performance Testing', 'Load Testing', 'JMeter', 'Performance Monitoring', 'Optimization']
            },
            {
                'title': 'QA Lead',
                'category': 'TESTING',
                'description': 'Leads quality assurance teams and establishes testing processes',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Test Strategy', 'Team Leadership', 'Quality Processes', 'Risk Assessment']
            },

            # IT Support Roles
            {
                'title': 'IT Support Specialist',
                'category': 'SUPPORT',
                'description': 'Provides technical support and troubleshooting for IT systems',
                'is_in_demand': True,
                'remote_friendly': False,
                'skills': ['Technical Support', 'Troubleshooting', 'Hardware', 'Software', 'Customer Service', 'Windows', 'Linux']
            },
            {
                'title': 'Help Desk Technician',
                'category': 'SUPPORT',
                'description': 'Provides first-line technical support to end-users',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Help Desk', 'Technical Support', 'Ticketing Systems', 'Remote Support', 'Customer Service']
            },
            {
                'title': 'Desktop Support Analyst',
                'category': 'SUPPORT',
                'description': 'Supports desktop computers and peripheral devices',
                'is_in_demand': True,
                'remote_friendly': False,
                'skills': ['Desktop Support', 'Hardware', 'Windows', 'macOS', 'Printer Support', 'Network Troubleshooting']
            },

            # Networking Roles
            {
                'title': 'Network Engineer',
                'category': 'NETWORKING',
                'description': 'Designs and maintains computer networks and infrastructure',
                'is_in_demand': True,
                'remote_friendly': False,
                'skills': ['Networking', 'Cisco', 'TCP/IP', 'Network Security', 'Routing', 'Switching', 'Firewalls']
            },
            {
                'title': 'Network Administrator',
                'category': 'NETWORKING',
                'description': 'Manages and maintains network infrastructure and services',
                'is_in_demand': True,
                'remote_friendly': False,
                'skills': ['Network Administration', 'Windows Server', 'Linux', 'DNS', 'DHCP', 'VPN']
            },
            {
                'title': 'Cloud Network Engineer',
                'category': 'NETWORKING',
                'description': 'Designs and implements cloud networking solutions',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['AWS Networking', 'Azure Networking', 'VPC', 'Load Balancing', 'Cloud Security']
            },

            # Database Roles
            {
                'title': 'Database Administrator',
                'category': 'DATABASE',
                'description': 'Manages and maintains database systems and performance',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['SQL', 'Database Administration', 'Performance Tuning', 'Backup/Recovery', 'Oracle', 'MySQL']
            },
            {
                'title': 'Database Developer',
                'category': 'DATABASE',
                'description': 'Designs and develops database structures and queries',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['SQL', 'Database Design', 'Stored Procedures', 'Query Optimization', 'ETL']
            },
            {
                'title': 'Data Warehouse Engineer',
                'category': 'DATABASE',
                'description': 'Designs and maintains data warehouse systems',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Data Warehousing', 'ETL', 'SQL', 'BI Tools', 'Data Modeling']
            },

            # Leadership & Architecture Roles
            {
                'title': 'Software Architect',
                'category': 'DEVELOPMENT',
                'description': 'Designs high-level software architecture and technical strategy',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['System Architecture', 'Design Patterns', 'Microservices', 'Scalability', 'Leadership', 'Cloud Architecture']
            },
            {
                'title': 'Technical Lead',
                'category': 'DEVELOPMENT',
                'description': 'Leads development teams and provides technical guidance',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Technical Leadership', 'Mentoring', 'Code Review', 'Architecture', 'Team Management']
            },
            {
                'title': 'Engineering Manager',
                'category': 'PROJECT_MGMT',
                'description': 'Manages engineering teams and technical projects',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Team Management', 'Project Management', 'Technical Strategy', 'Hiring', 'Budgeting']
            },
            {
                'title': 'CTO/Technical Director',
                'category': 'PROJECT_MGMT',
                'description': 'Leads technology strategy and innovation for organizations',
                'is_in_demand': True,
                'remote_friendly': True,
                'skills': ['Technology Strategy', 'Leadership', 'Innovation', 'Budget Management', 'Team Building']
            }
        ]
        
        for role_data in job_roles:
            skills_data = role_data.pop('skills')
            role, created = JobRole.objects.get_or_create(
                title=role_data['title'],
                defaults=role_data
            )
            
            # Add skills
            for skill_name in skills_data:
                skill, _ = Skill.objects.get_or_create(name=skill_name)
                role.skills.add(skill)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {len(job_roles)} job roles'))