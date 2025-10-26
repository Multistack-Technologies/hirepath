import json
import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Model Imports - JobRole REMOVED
from certificate_providers.models import CertificateProvider
from skills.models import Skill
from .models import Resume
from .serializers import ResumeSerializer

# Third-party Imports
import docx
from PyPDF2 import PdfReader

# Import the core analysis service functions
from .analysis_service import call_gemini_analyze, initialize_gemini_client

# -------------------------
# Utility for Text Extraction (REMAINS ESSENTIAL)
# -------------------------
def extract_text_from_docx(file_path_or_fileobj):
    doc = docx.Document(file_path_or_fileobj)
    return "\n".join([p.text for p in doc.paragraphs]).strip()

def extract_text_from_pdf(file_path_or_fileobj):
    reader = PdfReader(file_path_or_fileobj)
    pages = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n".join(pages).strip()

def extract_text_from_fileobj(file_obj, filename):
    name = filename.lower()
    if name.endswith(".pdf"):
        return extract_text_from_pdf(file_obj)
    elif name.endswith(".docx"):
        return extract_text_from_docx(file_obj)
    else:
        raise ValueError("Unsupported file type")

# -------------------------
# Skill Database Interaction (CORE HEURISTIC - Must be retained)
# -------------------------
def get_skills_from_database():
    """Get all skills from the database with their IDs"""
    skills = Skill.objects.all()
    return {skill.name.lower(): {"id": skill.id, "name": skill.name} for skill in skills}

def extract_skills_from_text(text):
    """Extract skills from resume text using skills from database, providing IDs."""
    database_skills = get_skills_from_database()
    found_skills = []
    text_lower = text.lower()
    
    for skill_name, skill_data in database_skills.items():
        if re.search(rf'\b{re.escape(skill_name)}\b', text_lower):
            found_skills.append({
                "id": skill_data["id"],
                "name": skill_data["name"]
            })
    return found_skills

# -------------------------
# Heuristic Certificate Recommendations (Simplified, based on ALL extracted skills)
# -------------------------
def recommend_certificates_for_extracted_skills(extracted_skills, top_n=5):
    """Recommend popular/relevant certificates related to the user's existing skills."""
    if not extracted_skills:
        return []
    
    extracted_skill_names = [s['name'] for s in extracted_skills]
    
    # Find certificate providers that cover the user's *existing* skills
    certificate_providers = CertificateProvider.objects.prefetch_related('skills').filter(
        skills__name__in=extracted_skill_names
    ).distinct()
    
    recommendations = []
    for provider in certificate_providers:
        provider_skills = [skill.name for skill in provider.skills.all()]
        relevant_skills = [skill for skill in provider_skills if skill.lower() in [s.lower() for s in extracted_skill_names]]
        
        if relevant_skills:
            # Score based on how many of the *user's skills* the certificate builds upon
            relevance_score = int((len(relevant_skills) / max(1, len(extracted_skills))) * 100)
            recommendations.append({
                "certificate_name": provider.name,
                "provider": provider.issuer_name,
                "reason": f"Enhances existing skills like {', '.join(relevant_skills[:3])}.",
                "relevance_score": min(relevance_score, 100),
                "skills_built_upon": relevant_skills,
                "provider_info": {"id": provider.id, "website": provider.website}
            })
    
    recommendations.sort(key=lambda x: x['relevance_score'], reverse=True)
    return recommendations[:top_n]

# -------------------------
# Simple Heuristic Fallback (For AI failure - skills only)
# -------------------------
def simple_skills_heuristic_analysis(text):
    """Simple fallback analysis that runs local skill extraction."""
    
    extracted_skills = extract_skills_from_text(text)
    
    return {
        "score": 50, # Neutral score since no job spec is used for matching
        "match_strength": "N/A",
        "found_skills": [skill['name'] for skill in extracted_skills],
        "missing_skills": [],
        "strengths": ["Database-matched skills found."],
        "weaknesses": ["Analysis limited to local skill keywords."],
        "suggested_actions": ["Analyze skills against a specific role."],
        "extracted_data": {
            "skills": extracted_skills,
            "education": [],
            "certificates": [],
            "experience": [],
            "summary": "Heuristic skill extraction only."
        }
    }


# -------------------------
# API endpoints (Skills Only)
# -------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_and_analyze_resume(request):
    uploaded_file = request.FILES.get('file')
    if not uploaded_file or not uploaded_file.name.lower().endswith(('.pdf', '.docx')):
        return Response({"error": "Please provide a valid .pdf or .docx file."}, status=status.HTTP_400_BAD_REQUEST)

    resume = Resume.objects.create(user=request.user, file=uploaded_file)
    try:
        extracted_text = extract_text_from_fileobj(request.FILES['file'], uploaded_file.name)
        resume.text = extracted_text
        resume.save()
    except Exception as e:
        return Response({"error": f"Text extraction failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Job spec is explicitly ignored or passed as None to the AI service
    job_spec = None
    
    # Bundle local functions for the service
    extract_funcs = {
        'skills': extract_skills_from_text,
        'heuristic_fallback': simple_skills_heuristic_analysis
    }

    try:
        # Call the imported service function for skill analysis
        ai_result = call_gemini_analyze(extracted_text, job_spec=job_spec, extract_funcs=extract_funcs)
        
        # Add certificate recommendations based on extracted skills
        if 'extracted_data' in ai_result and 'skills' in ai_result['extracted_data']:
            extracted_skills = ai_result['extracted_data']['skills']
            
            certificate_recommendations = recommend_certificates_for_extracted_skills(
                extracted_skills
            )
            ai_result['certificate_recommendations'] = certificate_recommendations
        
    except Exception as e:
        ai_result = {"error": f"AI call failed: {str(e)}"}

    resume.ai_feedback = ai_result
    resume.save()

    serializer = ResumeSerializer(resume)
    return Response({"resume": serializer.data}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_resume(request):
    resume = Resume.objects.filter(user=request.user).order_by('-uploaded_at').first()
    if not resume:
        return Response({"error": "No resume found."}, status=status.HTTP_404_NOT_FOUND)
    serializer = ResumeSerializer(resume)
    return Response({"resume": serializer.data}, status=status.HTTP_200_OK)

# The following job role endpoint is now redundant and should be REMOVED from URLs, 
# but we will keep a placeholder to avoid import errors in a real system.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_job_role_recommendations(request, resume_id):
    """This endpoint is now deprecated in the skills-only system."""
    return Response({"error": "Job matching is disabled. System is skills-only."}, 
                    status=status.HTTP_400_BAD_REQUEST)