# backend/resumes/engine.py
import PyPDF2
import docx
import re
import spacy
from io import BytesIO
import os
from datetime import datetime
from dateutil.parser import parse
from django.core.files.storage import default_storage
from .models import SAJobMarketData, CVAnalysis

# Load spaCy model for advanced NLP
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
    nlp = None

# South African Market Data
SA_MARKET_DATA = {
    "skills_demand": {
        "python": {"demand": 85, "salary_impact": 15},
        "javascript": {"demand": 80, "salary_impact": 12},
        "react": {"demand": 75, "salary_impact": 18},
        "aws": {"demand": 70, "salary_impact": 20},
        "docker": {"demand": 60, "salary_impact": 15},
        "machine learning": {"demand": 50, "salary_impact": 25},
        "cybersecurity": {"demand": 70, "salary_impact": 20},
    },
    "salary_ranges": {
        "Johannesburg": {
            "Junior Developer": [18000, 35000],
            "Senior Developer": [45000, 85000],
            "Data Analyst": [25000, 50000],
        },
        "Cape Town": {
            "Junior Developer": [20000, 38000],
            "Senior Developer": [48000, 90000],
            "Data Analyst": [28000, 55000],
        }
    }
}

def extract_text_from_file(file_path):
    """Extract text from PDF or DOCX files"""
    try:
        with default_storage.open(file_path, 'rb') as file:
            file_content = file.read()
        
        file_like = BytesIO(file_content)
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()

        if ext == '.pdf':
            reader = PyPDF2.PdfReader(file_like)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        elif ext in ['.docx']:
            doc = docx.Document(file_like)
            text = "\n".join([para.text for para in doc.paragraphs])
            return text
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

def analyze_text_quality(text):
    """Analyze the quality and structure of resume text"""
    if not text or len(text.strip()) == 0:
        return {"score": 0, "issues": ["Empty or invalid resume text"]}
    
    issues = []
    score = 100  # Start with perfect score
    
    # Check length
    word_count = len(text.split())
    if word_count < 50:
        issues.append("Resume seems too short")
        score -= 30
    elif word_count > 1000:
        issues.append("Resume might be too long")
        score -= 10
    
    # Check for common resume sections
    section_keywords = {
        'experience': ['experience', 'work history', 'employment'],
        'education': ['education', 'qualification', 'degree'],
        'skills': ['skills', 'technical skills', 'competencies']
    }
    
    missing_sections = []
    text_lower = text.lower()
    
    for section, keywords in section_keywords.items():
        if not any(keyword in text_lower for keyword in keywords):
            missing_sections.append(section)
    
    if missing_sections:
        issues.append(f"Missing common sections: {', '.join(missing_sections)}")
        score -= len(missing_sections) * 10
    
    # Check for contact information
    contact_patterns = [
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # email
        r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'  # phone
    ]
    
    contact_info_found = any(re.search(pattern, text) for pattern in contact_patterns)
    if not contact_info_found:
        issues.append("Contact information may be missing")
        score -= 15
    
    # Check formatting issues
    if text.count('\n') < 5:
        issues.append("Poor formatting - may lack proper structure")
        score -= 10
    
    # Check for excessive whitespace
    if '  ' in text or text.count('\n\n\n') > 3:
        issues.append("Formatting issues detected")
        score -= 5
    
    return {
        "score": max(0, score),
        "word_count": word_count,
        "issues": issues,
        "has_contact_info": contact_info_found,
        "missing_sections": missing_sections
    }

def extract_tools_technologies(text):
    """Extract tools and technologies from text"""
    tools = [
        'git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'trello',
        'vs code', 'visual studio', 'eclipse', 'intellij', 'pycharm',
        'postman', 'swagger', 'jenkins', 'travis', 'circleci'
    ]
    
    found_tools = []
    for tool in tools:
        if tool in text.lower():
            found_tools.append(tool.title())
    
    return found_tools

def categorize_skills(skills):
    """Categorize skills into domains"""
    categories = {
        'programming': [],
        'web_development': [],
        'cloud_devops': [],
        'data_ai': [],
        'soft_skills': []
    }
    
    skill_mapping = {
        'programming': ['python', 'java', 'javascript', 'c#', 'c++', 'go', 'rust'],
        'web_development': ['html', 'css', 'react', 'angular', 'vue', 'node.js'],
        'cloud_devops': ['aws', 'azure', 'docker', 'kubernetes', 'jenkins', 'terraform'],
        'data_ai': ['sql', 'machine learning', 'data science', 'tensorflow', 'pytorch'],
        'soft_skills': ['communication', 'leadership', 'teamwork', 'problem solving']
    }
    
    for skill in skills:
        skill_lower = skill.lower()
        for category, keywords in skill_mapping.items():
            if any(keyword in skill_lower for keyword in keywords):
                categories[category].append(skill)
                break
    
    return categories

def extract_experience_analysis(text):
    """Extract and analyze experience information"""
    experience = {}
    
    # Extract job titles
    experience['job_titles'] = extract_job_titles(text)
    
    # Extract companies (simplified)
    experience['companies'] = extract_companies(text)
    
    # Extract duration
    experience['total_experience'] = extract_experience_years(text)
    
    return experience

def extract_companies(text):
    """Extract company names (simplified version)"""
    # This is a simplified version - in production you'd want a more robust approach
    companies = []
    
    # Look for company-like patterns near job titles
    company_patterns = [
        r'at\s+([A-Z][a-zA-Z0-9\s&]+)',
        r',\s*([A-Z][a-zA-Z0-9\s&]+)',
    ]
    
    for pattern in company_patterns:
        matches = re.findall(pattern, text)
        companies.extend(matches)
    
    return list(set(companies))[:5]  # Return top 5 unique companies

def estimate_experience_from_dates(text):
    """Estimate experience from employment dates"""
    periods = extract_employment_periods(text)
    if not periods:
        return 0
    
    total_months = 0
    for period in periods:
        months = (period['end'].year - period['start'].year) * 12 + (period['end'].month - period['start'].month)
        total_months += months
    
    return total_months // 12

def calculate_career_gaps(periods):
    """Calculate total career gap in months"""
    if len(periods) < 2:
        return 0
    
    # Sort periods by start date
    sorted_periods = sorted(periods, key=lambda x: x['start'])
    
    total_gap = 0
    for i in range(len(sorted_periods) - 1):
        gap = (sorted_periods[i+1]['start'] - sorted_periods[i]['end']).days // 30
        if gap > 0:
            total_gap += gap
    
    return total_gap

def extract_gpa(text):
    """Extract GPA from text"""
    gpa_patterns = [
        r'GPA\s*:\s*(\d+\.\d+)',
        r'Grade Point Average\s*:\s*(\d+\.\d+)',
        r'\b(\d+\.\d+)\s*GPA',
    ]
    
    for pattern in gpa_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    
    return None

def extract_certifications(text):
    """Extract certifications from text"""
    common_certs = [
        'AWS', 'Azure', 'Google Cloud', 'PMP', 'Scrum Master', 'CISSP',
        'CEH', 'CCNA', 'CCNP', 'Microsoft Certified', 'Oracle Certified'
    ]
    
    found_certs = []
    for cert in common_certs:
        if cert.lower() in text.lower():
            found_certs.append(cert)
    
    return found_certs

def detect_management(text):
    """Detect management experience"""
    management_indicators = [
        'managed', 'directed', 'oversaw', 'supervised', 'headed', 'team of',
        'department', 'budget', 'strategy', 'planning', 'executive'
    ]
    
    return any(indicator in text.lower() for indicator in management_indicators)

def get_salary_benchmarks(job_role, locations):
    """Get salary benchmarks for job role and locations"""
    benchmarks = {}
    for location in locations:
        if location in SA_MARKET_DATA['salary_ranges']:
            if job_role in SA_MARKET_DATA['salary_ranges'][location]:
                benchmarks[location] = SA_MARKET_DATA['salary_ranges'][location][job_role]
    
    return benchmarks

def analyze_location_demand(job_role, locations):
    """Analyze location demand for job role"""
    # Simplified - in production, you'd have more sophisticated location analysis
    location_demand = {}
    for location in locations:
        # Base demand score with some variation
        base_demand = 70
        if location == 'Johannesburg':
            base_demand += 10
        elif location == 'Cape Town':
            base_demand += 5
        
        location_demand[location] = {
            'demand_score': base_demand,
            'opportunities': 'High' if base_demand > 70 else 'Medium'
        }
    
    return location_demand

def calculate_market_score(market_fit):
    """Calculate overall market score"""
    skills_score = market_fit.get('skills_demand_score', 0)
    location_score = 0
    
    location_demand = market_fit.get('location_demand', {})
    if location_demand:
        avg_location_score = sum(
            loc_data.get('demand_score', 0) for loc_data in location_demand.values()
        ) / len(location_demand)
        location_score = avg_location_score
    
    return (skills_score * 0.7 + location_score * 0.3)

def analyze_resume_comprehensive(text, job_role="Junior Developer", preferred_locations=None):
    """Comprehensive resume analysis"""
    if preferred_locations is None:
        preferred_locations = ["Johannesburg", "Cape Town"]
    
    analysis = {}
    
    # Basic text analysis
    analysis['text_quality'] = analyze_text_quality(text)
    
    # Extract comprehensive data
    analysis['personal_insights'] = extract_personal_insights(text)
    analysis['experience_analysis'] = extract_experience_analysis(text)
    analysis['education_analysis'] = extract_education_analysis(text)
    analysis['skills_analysis'] = extract_skills_analysis(text)
    analysis['achievement_metrics'] = extract_achievement_metrics(text)
    
    # Market analysis
    analysis['market_fit'] = analyze_market_fit(analysis, job_role, preferred_locations)
    analysis['improvement_recommendations'] = generate_recommendations(analysis)
    
    # Calculate overall score
    analysis['overall_score'] = calculate_overall_score(analysis)
    
    return analysis

def extract_personal_insights(text):
    """Extract personal and career insights"""
    insights = {}
    
    # Experience years
    experience_years = extract_experience_years(text)
    insights['years_experience'] = experience_years
    
    # Career gaps
    employment_periods = extract_employment_periods(text)
    insights['career_gap_months'] = calculate_career_gaps(employment_periods)
    insights['job_stability_score'] = calculate_job_stability(employment_periods)
    
    # Career progression
    job_titles = extract_job_titles(text)
    insights['career_progression'] = analyze_career_progression(job_titles)
    
    return insights

def extract_experience_years(text):
    """Extract total years of experience"""
    patterns = [
        r'(\d+)\s*years?\s*experience',
        r'experience.*?(\d+)\s*years',
        r'(\d+)\s*yr',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            return max([int(m) for m in matches])
    
    # Fallback: estimate from job history
    return estimate_experience_from_dates(text)

def extract_employment_periods(text):
    """Extract employment periods from text"""
    periods = []
    
    # Pattern for dates like "Jan 2020 - Dec 2022"
    date_pattern = r'(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\s*[-–—]\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\bPresent\b|\bCurrent\b)'
    
    matches = re.findall(date_pattern, text, re.IGNORECASE)
    for start, end in matches:
        try:
            start_date = parse(start)
            end_date = parse(end) if end.lower() not in ['present', 'current'] else datetime.now()
            periods.append({'start': start_date, 'end': end_date})
        except:
            continue
    
    return periods

def calculate_job_stability(periods):
    """Calculate job stability score"""
    if len(periods) < 2:
        return 80  # Single job or no history
    
    total_months = sum(
        (period['end'].year - period['start'].year) * 12 + 
        (period['end'].month - period['start'].month)
        for period in periods
    )
    
    avg_months = total_months / len(periods)
    
    if avg_months >= 24: return 90
    elif avg_months >= 18: return 75
    elif avg_months >= 12: return 60
    else: return 40

def extract_job_titles(text):
    """Extract job titles from text"""
    titles = []
    common_titles = [
        'developer', 'engineer', 'analyst', 'manager', 'director', 'lead',
        'architect', 'consultant', 'specialist', 'coordinator'
    ]
    
    # Look for title patterns
    title_pattern = r'(\b\w+\s+(?:' + '|'.join(common_titles) + r'))'
    matches = re.findall(title_pattern, text, re.IGNORECASE)
    titles.extend(matches)
    
    return list(set(titles))

def analyze_career_progression(job_titles):
    """Analyze career progression from job titles"""
    if not job_titles:
        return {"level": "unknown", "progression": "insufficient data"}
    
    seniority_keywords = {
        'junior': 1, 'entry': 1, 'graduate': 1,
        'mid': 2, 'intermediate': 2,
        'senior': 3, 'lead': 3, 'principal': 4,
        'manager': 4, 'director': 5, 'head': 5
    }
    
    levels = []
    for title in job_titles:
        title_lower = title.lower()
        for keyword, level in seniority_keywords.items():
            if keyword in title_lower:
                levels.append(level)
                break
    
    if levels:
        current_level = max(levels)
        progression = "progressive" if len(set(levels)) > 1 else "stable"
        return {"current_level": current_level, "progression": progression}
    
    return {"level": "unknown", "progression": "insufficient data"}

def extract_education_analysis(text):
    """Extract and analyze education information"""
    education = {}
    
    # Extract qualifications
    qualifications = extract_qualifications(text)
    education['qualifications'] = qualifications
    education['education_level'] = determine_education_level(qualifications)
    
    # Extract GPA
    education['gpa'] = extract_gpa(text)
    
    # Extract certifications
    education['certifications'] = extract_certifications(text)
    
    return education

def extract_qualifications(text):
    """Extract educational qualifications"""
    qualifications = []
    degree_patterns = [
        r'\b(?:B\.?Sc|B\.?Eng|B\.?Com|B\.?Tech|Bachelor)\b',
        r'\b(?:M\.?Sc|M\.?Eng|Master)\b',
        r'\b(?:PhD|Doctorate)\b',
        r'\b(?:Diploma|Certificate)\b'
    ]
    
    for pattern in degree_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        qualifications.extend(matches)
    
    return list(set(qualifications))

def determine_education_level(qualifications):
    """Determine highest education level"""
    qual_text = ' '.join(qualifications).lower()
    
    if any(word in qual_text for word in ['phd', 'doctorate']):
        return "Doctorate"
    elif any(word in qual_text for word in ['m.sc', 'm.eng', 'master']):
        return "Master's"
    elif any(word in qual_text for word in ['b.sc', 'b.eng', 'b.com', 'bachelor']):
        return "Bachelor's"
    elif any(word in qual_text for word in ['diploma', 'certificate']):
        return "Diploma/Certificate"
    else:
        return "Unknown"

def extract_skills_analysis(text):
    """Comprehensive skills analysis"""
    skills = {}
    
    # Technical skills
    skills['technical'] = extract_technical_skills(text)
    skills['soft'] = extract_soft_skills(text)
    skills['tools'] = extract_tools_technologies(text)
    
    # Skill categories
    skills['categories'] = categorize_skills(skills['technical'])
    
    return skills

def extract_technical_skills(text):
    """Extract technical skills"""
    technical_skills = [
        'python', 'javascript', 'java', 'c#', 'c++', 'sql', 'html', 'css',
        'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring',
        'aws', 'azure', 'docker', 'kubernetes', 'jenkins', 'git',
        'machine learning', 'data analysis', 'cybersecurity', 'networking'
    ]
    
    found_skills = []
    for skill in technical_skills:
        if skill in text.lower():
            found_skills.append(skill.title())
    
    return found_skills

def extract_soft_skills(text):
    """Extract soft skills"""
    soft_skills = [
        'leadership', 'communication', 'teamwork', 'problem solving',
        'critical thinking', 'adaptability', 'time management',
        'project management', 'agile', 'scrum'
    ]
    
    found_skills = []
    for skill in soft_skills:
        if skill in text.lower():
            found_skills.append(skill.title())
    
    return found_skills

def extract_achievement_metrics(text):
    """Extract and quantify achievements"""
    achievements = {}
    
    # Quantifiable achievements
    achievements['quantifiable'] = extract_quantifiable_achievements(text)
    achievements['count'] = len(achievements['quantifiable'])
    
    # Leadership indicators
    achievements['leadership'] = detect_leadership(text)
    achievements['management'] = detect_management(text)
    
    return achievements

def extract_quantifiable_achievements(text):
    """Extract achievements with numbers"""
    patterns = [
        r'increased\s+.*?\s+by\s+(\d+%|\$\d+)',
        r'reduced\s+.*?\s+by\s+(\d+%|\$\d+)',
        r'improved\s+.*?\s+by\s+(\d+%)',
        r'saved\s+.*?\s+(\$\d+|\d+%|\d+\s+hours)',
        r'achieved\s+.*?\s+(\d+%|\$\d+)',
        r'managed\s+.*?\s+of\s+(\$\d+)',
        r'led\s+.*?\s+team\s+of\s+(\d+)',
    ]
    
    achievements = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        achievements.extend(matches)
    
    return achievements

def detect_leadership(text):
    """Detect leadership experience"""
    leadership_indicators = [
        'led', 'managed', 'directed', 'oversaw', 'supervised', 'headed',
        'team lead', 'team leadership', 'mentored', 'guided', 'coordinated'
    ]
    
    return any(indicator in text.lower() for indicator in leadership_indicators)

def analyze_market_fit(analysis, job_role, preferred_locations):
    """Analyze market fit for South African job market"""
    market_fit = {}
    
    # Skills demand analysis
    technical_skills = analysis['skills_analysis']['technical']
    market_fit['skills_demand_score'] = calculate_skills_demand_score(technical_skills)
    
    # Salary compatibility
    market_fit['salary_benchmarks'] = get_salary_benchmarks(job_role, preferred_locations)
    
    # Location analysis
    market_fit['location_demand'] = analyze_location_demand(job_role, preferred_locations)
    
    # Overall market score
    market_fit['market_score'] = calculate_market_score(market_fit)
    
    return market_fit

def calculate_skills_demand_score(skills):
    """Calculate how in-demand the skills are"""
    if not skills:
        return 0
    
    total_demand = 0
    for skill in skills:
        skill_lower = skill.lower()
        if skill_lower in SA_MARKET_DATA['skills_demand']:
            total_demand += SA_MARKET_DATA['skills_demand'][skill_lower]['demand']
    
    return total_demand / len(skills) if skills else 0

def generate_recommendations(analysis):
    """Generate personalized recommendations"""
    recommendations = []
    
    # Skills recommendations
    skills = analysis['skills_analysis']['technical']
    high_demand_skills = ['Python', 'AWS', 'React', 'Docker']
    missing_high_demand = [skill for skill in high_demand_skills if skill not in skills]
    
    if missing_high_demand:
        recommendations.append({
            'category': 'skills',
            'priority': 'high',
            'message': f'Learn high-demand skills: {", ".join(missing_high_demand[:2])}',
            'actions': [
                'Take online courses on Coursera or Udemy',
                'Build projects using these technologies'
            ]
        })
    
    # Career recommendations
    experience = analysis['personal_insights'].get('years_experience', 0)
    if experience >= 5:
        recommendations.append({
            'category': 'career',
            'priority': 'medium',
            'message': 'Consider senior or leadership roles',
            'actions': [
                'Update your LinkedIn profile with leadership achievements',
                'Network with senior professionals in your industry'
            ]
        })
    
    return recommendations

def calculate_overall_score(analysis):
    """Calculate overall resume score"""
    weights = {
        'experience': 0.3,
        'skills': 0.25,
        'education': 0.15,
        'achievements': 0.2,
        'market_fit': 0.1
    }
    
    scores = {}
    
    # Experience score
    experience_years = analysis['personal_insights'].get('years_experience', 0)
    stability = analysis['personal_insights'].get('job_stability_score', 50)
    scores['experience'] = min(100, experience_years * 10 + stability * 0.5)
    
    # Skills score
    skills_demand = analysis['market_fit'].get('skills_demand_score', 0)
    skills_count = len(analysis['skills_analysis']['technical'])
    scores['skills'] = min(100, skills_demand + skills_count * 2)
    
    # Education score
    education_level = analysis['education_analysis'].get('education_level', 'Unknown')
    education_scores = {
        'Doctorate': 100, "Master's": 85, "Bachelor's": 70,
        'Diploma/Certificate': 60, 'Unknown': 40
    }
    scores['education'] = education_scores.get(education_level, 40)
    
    # Achievements score
    achievement_count = analysis['achievement_metrics'].get('count', 0)
    scores['achievements'] = min(100, achievement_count * 10)
    
    # Market fit score
    scores['market_fit'] = analysis['market_fit'].get('market_score', 50)
    
    # Calculate weighted average
    total_score = sum(scores[category] * weight for category, weight in weights.items())
    
    return round(total_score, 2)

# Main analysis function
def analyze_resume(file_path, job_role="Junior Developer", preferred_locations=None, salary_expectation=None):
    """Main resume analysis function"""
    if preferred_locations is None:
        preferred_locations = ["Johannesburg", "Cape Town", "Pretoria"]
    
    # Extract text
    raw_text = extract_text_from_file(file_path)
    if not raw_text:
        return {"error": "Failed to read the uploaded file."}
    
    # Comprehensive analysis
    comprehensive_analysis = analyze_resume_comprehensive(raw_text, job_role, preferred_locations)
    
    # Prepare response
    result = {
        "score": comprehensive_analysis['overall_score'],
        "skills_detected": comprehensive_analysis['skills_analysis']['technical'],
        "missing_skills": find_missing_skills(comprehensive_analysis['skills_analysis']['technical']),
        "feedback": generate_feedback(comprehensive_analysis),
        "job_role_matched": job_role,
        "comprehensive_analysis": comprehensive_analysis
    }
    
    return result

def find_missing_skills(detected_skills):
    """Find missing high-demand skills"""
    high_demand = ['Python', 'AWS', 'React', 'Docker', 'JavaScript']
    return [skill for skill in high_demand if skill not in detected_skills]

def generate_feedback(analysis):
    """Generate actionable feedback"""
    feedback = []
    
    # Skills feedback
    if analysis['market_fit']['skills_demand_score'] < 70:
        feedback.append("Your skills could be more aligned with current market demands.")
    
    # Experience feedback
    if analysis['personal_insights'].get('years_experience', 0) < 2:
        feedback.append("Consider gaining more practical experience through internships or projects.")
    
    # Achievement feedback
    if analysis['achievement_metrics']['count'] < 3:
        feedback.append("Add more quantifiable achievements to demonstrate impact.")
    
    return feedback