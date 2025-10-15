# backend/resumes/engine.py
import PyPDF2
import docx
from io import BytesIO
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# --- Mock South African IT Skills Database ---
# In a real app, this would likely come from a Django model or a file/database.
SA_IT_SKILLS = [
    "python", "java", "javascript", "html", "css", "react", "node.js", "sql",
    "mysql", "postgresql", "aws", "azure", "docker", "git", "github", "linux",
    "agile", "scrum", "api", "rest", "django", "flask", "machine learning",
    "data analysis", "cybersecurity", "networking", "c++", "c#", "android",
    "mobile development", "ui/ux", "typescript", "bootstrap", "jquery"
]

# --- Mock Job Role Requirements ---
# In a real app, this would come from the Job model or a dedicated Requirements model.
JOB_ROLE_REQUIREMENTS = {
    "Junior Developer": ["python", "javascript", "html", "css", "git", "sql"],
    "Data Analyst": ["python", "sql", "excel", "data analysis"],
    "Cybersecurity Analyst": ["cybersecurity", "networking", "linux", "aws"],
    "Full-Stack Developer": ["react", "node.js", "javascript", "git", "api"],
    "IT Support": ["troubleshooting", "windows", "networking", "customer service"]
}

def extract_text_from_file(file_path):
    """Extract text from a PDF or DOCX file."""
    try:
        with default_storage.open(file_path, 'rb') as file:
            file_content = file.read()
        
        # Use BytesIO to treat the content as a file-like object
        file_like = BytesIO(file_content)
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()

        if ext == '.pdf':
            reader = PyPDF2.PdfReader(file_like)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or "" # Handle None from extract_text
            return text.lower()
        elif ext in ['.docx']:
            doc = docx.Document(file_like)
            text = "\n".join([para.text for para in doc.paragraphs])
            return text.lower()
        elif ext == '.doc': # Basic support for .doc, might need python-docx2 for full support
            # For simplicity, return a placeholder or log a warning
            # A robust solution would use a library like antiword or python-docx2
            print("Warning: .doc format support is limited.")
            return "Text extraction for .doc files is not fully supported."
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return "" # Return empty string on error

def extract_skills(text):
    """Extract IT skills mentioned in the text."""
    found_skills = []
    for skill in SA_IT_SKILLS:
        # Simple keyword matching. Can be enhanced with NLP/spaCy for better accuracy.
        if skill in text:
            # Capitalize for display, avoid duplicates
            skill_title_case = skill.title()
            if skill_title_case not in found_skills:
                found_skills.append(skill_title_case)
    return found_skills

def calculate_score_and_feedback(skills_detected, job_role="Junior Developer"):
    """Calculate score and generate feedback based on job role requirements."""
    required_skills = JOB_ROLE_REQUIREMENTS.get(job_role, ["python", "sql", "git"])
    
    # --- Calculate Score ---
    matched_skills = [s for s in skills_detected if s.lower() in [rs.lower() for rs in required_skills]]
    score = (len(matched_skills) / len(required_skills)) * 100 if required_skills else 0
    
    # --- Identify Missing Skills ---
    missing_skills = [s for s in required_skills if s.title() not in skills_detected]
    
    # --- Generate Feedback ---
    feedback = []
    if "Git" not in skills_detected:
        feedback.append("Add GitHub or version control experience.")
    if "Python" not in skills_detected and "python" in [rs.lower() for rs in required_skills]:
        feedback.append("Include Python projects or coursework.")
    if len(skills_detected) < 3:
        feedback.append("Expand your skills section with tools and projects.")
    if score < 60:
        feedback.append("Your resume needs more relevant technical skills.")

    return {
        "score": round(score, 2),
        "skills_detected": skills_detected,
        "missing_skills": missing_skills,
        "feedback": feedback,
        "job_role_matched": job_role
    }

# --- Main AI Analysis Function ---
def analyze_resume(file_path, job_role="Junior Developer"):

    raw_text = extract_text_from_file(file_path)
    if not raw_text:
        return {"error": "Failed to read the uploaded file."}

    skills = extract_skills(raw_text)

    result = calculate_score_and_feedback(skills, job_role)

    return result