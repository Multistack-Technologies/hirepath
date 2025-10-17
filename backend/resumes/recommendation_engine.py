# resumes/recommendation_engine.py
from django.db.models import Count, Q
from skills.models import Skill
from job_roles.models import JobRole
from certificates.models import Certificate
from accounts.models import User
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter

class CareerRecommendationEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    
    def get_user_skills_vector(self, user):
        """Get user skills as a text vector"""
        user_skills = list(user.skills.values_list('name', flat=True))
        return ' '.join(user_skills)
    
    def get_job_role_vector(self, job_role):
        """Get job role requirements as a text vector"""
        skills = list(job_role.skills.values_list('name', flat=True))
        description = job_role.description or ""
        return ' '.join(skills) + ' ' + description
    
    def get_certificate_vector(self, certificate):
        """Get certificate details as a text vector"""
        skills = list(certificate.skills.values_list('name', flat=True))
        description = certificate.description or ""
        return ' '.join(skills) + ' ' + description
    
    def recommend_job_roles(self, user, top_n=10):
        """Recommend job roles based on user skills and profile"""
        try:
            # Get user data
            user_skills = set(user.skills.values_list('name', flat=True))
            user_educations = user.educations.all()
            user_certificates = user.certificates.all()
            user_experience = user.work_experiences.all()
            
            # Get all job roles
            all_job_roles = JobRole.objects.prefetch_related('skills').all()
            
            recommendations = []
            
            for job_role in all_job_roles:
                # Calculate match score
                match_score = self.calculate_job_role_match(
                    user_skills, user_educations, user_certificates, 
                    user_experience, job_role
                )
                
                # Get missing skills
                job_skills = set(job_role.skills.values_list('name', flat=True))
                missing_skills = job_skills - user_skills
                
                recommendations.append({
                    'job_role': {
                        'id': job_role.id,
                        'title': job_role.title,
                        'category': job_role.get_category_display(),
                        'description': job_role.description,
                        'is_in_demand': job_role.is_in_demand,
                        'remote_friendly': job_role.remote_friendly
                    },
                    'match_score': round(match_score, 2),
                    'matching_skills': list(user_skills.intersection(job_skills)),
                    'missing_skills': list(missing_skills),
                    'skill_gap_count': len(missing_skills),
                    'career_path': self.get_career_path_advice(user, job_role)
                })
            
            # Sort by match score and return top N
            recommendations.sort(key=lambda x: x['match_score'], reverse=True)
            return recommendations[:top_n]
            
        except Exception as e:
            print(f"Error in job role recommendation: {e}")
            return []
    
    def calculate_job_role_match(self, user_skills, user_educations, user_certificates, user_experience, job_role):
        """Calculate comprehensive match score for job role"""
        total_score = 0
        criteria_weights = {
            'skills': 0.5,      # 50% weight for skills
            'experience': 0.3,  # 30% for experience
            'education': 0.15,  # 15% for education
            'certificates': 0.05 # 5% for certificates
        }
        
        # 1. Skills Match
        job_skills = set(job_role.skills.values_list('name', flat=True))
        if job_skills:
            skills_match = len(user_skills.intersection(job_skills)) / len(job_skills)
            total_score += skills_match * criteria_weights['skills'] * 100
        
        # 2. Experience Match (simplified)
        experience_score = self.calculate_experience_match(user_experience, job_role)
        total_score += experience_score * criteria_weights['experience'] * 100
        
        # 3. Education Match
        education_score = self.calculate_education_match(user_educations, job_role)
        total_score += education_score * criteria_weights['education'] * 100
        
        # 4. Certificate Match
        certificate_score = self.calculate_certificate_match(user_certificates, job_role)
        total_score += certificate_score * criteria_weights['certificates'] * 100
        
        return min(total_score, 100)
    
    def calculate_experience_match(self, user_experience, job_role):
        """Calculate experience level match"""
        # Count total months of experience
        total_months = 0
        for exp in user_experience:
            if exp.end_date and exp.start_date:
                duration = (exp.end_date - exp.start_date).days // 30
                total_months += duration
            elif exp.is_current:
                # Ongoing job - estimate until now
                from django.utils import timezone
                duration = (timezone.now().date() - exp.start_date).days // 30
                total_months += duration
        
        total_years = total_months / 12
        
        # Simple experience level mapping
        if total_years >= 5:
            user_level = 3  # Senior
        elif total_years >= 2:
            user_level = 2  # Mid
        else:
            user_level = 1  # Entry
        
        # Job role experience expectation (simplified)
        job_level_mapping = {
            'Senior': 3,
            'Lead': 3,
            'Mid': 2,
            'Entry': 1
        }
        
        # Simple keyword matching for job titles
        job_title_lower = job_role.title.lower()
        if any(word in job_title_lower for word in ['senior', 'lead', 'principal', 'manager']):
            job_level = 3
        elif any(word in job_title_lower for word in ['mid', 'intermediate', 'experienced']):
            job_level = 2
        else:
            job_level = 1
        
        return min(user_level / job_level, 1.0) if job_level > 0 else 0
    
    def calculate_education_match(self, user_educations, job_role):
        """Calculate education match"""
        if not user_educations:
            return 0
        
        # Simple check - if user has any higher education
        has_higher_education = user_educations.exists()
        
        # Job roles that typically require higher education
        education_required_roles = ['Data Scientist', 'Machine Learning Engineer', 'Research Scientist']
        
        if job_role.title in education_required_roles:
            return 1.0 if has_higher_education else 0.3
        else:
            return 0.7 if has_higher_education else 0.5
    
    def calculate_certificate_match(self, user_certificates, job_role):
        """Calculate certificate match"""
        if not user_certificates:
            return 0
        
        # Count relevant certificates
        relevant_cert_count = 0
        job_skills = set(job_role.skills.values_list('name', flat=True))
        
        for cert in user_certificates:
            cert_skills = set(cert.skills.values_list('name', flat=True))
            if cert_skills.intersection(job_skills):
                relevant_cert_count += 1
        
        return min(relevant_cert_count / 3, 1.0)  # Normalize to max 3 relevant certificates
    
    def get_career_path_advice(self, user, job_role):
        """Generate career path advice"""
        user_skills = set(user.skills.values_list('name', flat=True))
        job_skills = set(job_role.skills.values_list('name', flat=True))
        missing_skills = job_skills - user_skills
        
        advice = []
        
        if missing_skills:
            advice.append(f"Develop skills in: {', '.join(list(missing_skills)[:3])}")
        
        # Industry-specific advice
        if job_role.category == 'DATA':
            advice.append("Consider building portfolio projects with real datasets")
        elif job_role.category == 'DEVOPS':
            advice.append("Gain hands-on experience with cloud platforms and CI/CD tools")
        elif job_role.category == 'CYBERSECURITY':
            advice.append("Participate in CTF competitions and security certifications")
        
        return advice
    
    def recommend_certificates(self, user, top_n=10):
        """Recommend certificates based on user skills and career goals"""
        try:
            user_skills = set(user.skills.values_list('name', flat=True))
            user_target_roles = user.target_job_roles.all()
            
            # Get all certificates
            all_certificates = Certificate.objects.prefetch_related('skills', 'provider').all()
            
            recommendations = []
            
            for certificate in all_certificates:
                # Calculate relevance score
                relevance_score = self.calculate_certificate_relevance(
                    user_skills, user_target_roles, certificate
                )
                
                cert_skills = set(certificate.skills.values_list('name', flat=True))
                new_skills = cert_skills - user_skills
                
                recommendations.append({
                    'certificate': {
                        'id': certificate.id,
                        'name': certificate.provider.name,
                        'issuer': certificate.provider.issuer_name,
                        'description': certificate.description,
                        'website': certificate.provider.website,
                        'skills': list(cert_skills)
                    },
                    'relevance_score': round(relevance_score, 2),
                    'new_skills_offered': list(new_skills),
                    'skill_gain_count': len(new_skills),
                    'career_impact': self.get_certificate_career_impact(certificate, user_target_roles)
                })
            
            # Sort by relevance and return top N
            recommendations.sort(key=lambda x: x['relevance_score'], reverse=True)
            return recommendations[:top_n]
            
        except Exception as e:
            print(f"Error in certificate recommendation: {e}")
            return []
    
    def calculate_certificate_relevance(self, user_skills, user_target_roles, certificate):
        """Calculate certificate relevance score"""
        total_score = 0
        
        # 1. Skills overlap (40%)
        cert_skills = set(certificate.skills.values_list('name', flat=True))
        if cert_skills:
            skills_overlap = len(user_skills.intersection(cert_skills)) / len(cert_skills)
            total_score += skills_overlap * 40
        
        # 2. New skills value (30%)
        new_skills = cert_skills - user_skills
        if new_skills:
            # Value based on number of new skills (capped at 5)
            new_skills_value = min(len(new_skills) / 5, 1.0) * 30
            total_score += new_skills_value
        
        # 3. Career alignment (30%)
        career_alignment = self.calculate_career_alignment(certificate, user_target_roles)
        total_score += career_alignment * 30
        
        return total_score
    
    def calculate_career_alignment(self, certificate, user_target_roles):
        """Calculate how well certificate aligns with user's target roles"""
        if not user_target_roles:
            return 0.5  # Neutral score if no target roles
        
        cert_skills = set(certificate.skills.values_list('name', flat=True))
        
        alignment_scores = []
        for target_role in user_target_roles:
            role_skills = set(target_role.skills.values_list('name', flat=True))
            if role_skills:
                alignment = len(cert_skills.intersection(role_skills)) / len(role_skills)
                alignment_scores.append(alignment)
        
        return np.mean(alignment_scores) if alignment_scores else 0
    
    def get_certificate_career_impact(self, certificate, user_target_roles):
        """Get career impact description for certificate"""
        cert_skills = list(certificate.skills.values_list('name', flat=True))
        
        impact = []
        
        if any(skill in cert_skills for skill in ['AWS', 'Azure', 'Google Cloud']):
            impact.append("High demand in cloud computing roles")
        
        if any(skill in cert_skills for skill in ['Cybersecurity', 'Security', 'Penetration Testing']):
            impact.append("Essential for security-focused positions")
        
        if any(skill in cert_skills for skill in ['Machine Learning', 'AI', 'Data Science']):
            impact.append("Valuable for data and AI roles")
        
        # Check alignment with target roles
        if user_target_roles:
            role_names = [role.title for role in user_target_roles[:2]]
            impact.append(f"Aligns with your interest in {', '.join(role_names)}")
        
        return impact[:2]  # Return top 2 impacts
    
    def get_career_insights(self, user):
        """Generate comprehensive career insights"""
        insights = {
            'skill_analysis': self.analyze_user_skills(user),
            'career_growth': self.get_career_growth_opportunities(user),
            'market_trends': self.get_market_trends_insights(user),
            'learning_path': self.get_learning_path_recommendations(user)
        }
        return insights
    
    def analyze_user_skills(self, user):
        """Analyze user's skill profile"""
        user_skills = list(user.skills.values_list('name', flat=True))
        
        # Categorize skills
        skill_categories = {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'go', 'rust'],
            'web_development': ['html', 'css', 'react', 'angular', 'vue', 'node.js'],
            'cloud_devops': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
            'data_ai': ['sql', 'machine learning', 'data science', 'tensorflow', 'pytorch'],
            'soft_skills': ['communication', 'leadership', 'problem solving', 'teamwork']
        }
        
        analysis = {}
        for category, skills in skill_categories.items():
            category_skills = [skill for skill in user_skills if any(s in skill.lower() for s in skills)]
            analysis[category] = {
                'count': len(category_skills),
                'skills': category_skills
            }
        
        return analysis
    
    def get_career_growth_opportunities(self, user):
        """Identify career growth opportunities"""
        opportunities = []
        user_skills = set(user.skills.values_list('name', flat=True))
        
        # High-demand skills analysis
        high_demand_skills = ['AI', 'Machine Learning', 'Cloud Computing', 'Cybersecurity', 'DevOps']
        missing_high_demand = [skill for skill in high_demand_skills 
                             if not any(skill.lower() in user_skill.lower() for user_skill in user_skills)]
        
        if missing_high_demand:
            opportunities.append(f"Consider learning high-demand skills: {', '.join(missing_high_demand)}")
        
        # Experience-based opportunities
        user_experience = user.work_experiences.count()
        if user_experience < 2:
            opportunities.append("Build more project experience and consider internships")
        elif user_experience < 5:
            opportunities.append("Look for mid-level positions and leadership opportunities")
        else:
            opportunities.append("Consider senior/architect roles and mentoring opportunities")
        
        return opportunities
    
    def get_market_trends_insights(self, user):
        """Provide market trends insights"""
        trends = []
        
        # Get popular job roles
        popular_roles = JobRole.objects.filter(is_in_demand=True)[:3]
        if popular_roles:
            role_names = [role.title for role in popular_roles]
            trends.append(f"High demand for: {', '.join(role_names)}")
        
        # Remote work trends
        remote_roles = JobRole.objects.filter(remote_friendly=True).count()
        total_roles = JobRole.objects.count()
        remote_percentage = (remote_roles / total_roles) * 100 if total_roles > 0 else 0
        trends.append(f"{remote_percentage:.1f}% of tech roles offer remote work")
        
        return trends
    
    def get_learning_path_recommendations(self, user):
        """Generate personalized learning path"""
        learning_path = []
        user_skills = set(user.skills.values_list('name', flat=True))
        
        # Identify skill gaps for target roles
        target_roles = user.target_job_roles.all()
        if target_roles:
            for role in target_roles[:2]:
                role_skills = set(role.skills.values_list('name', flat=True))
                missing_skills = role_skills - user_skills
                if missing_skills:
                    learning_path.append({
                        'role': role.title,
                        'skills_to_learn': list(missing_skills)[:3],
                        'priority': 'High' if role.is_in_demand else 'Medium'
                    })
        
        return learning_path