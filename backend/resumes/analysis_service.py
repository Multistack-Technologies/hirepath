import os
import json
import re
from django.conf import settings

# Attempt to import Google GenAI SDK
try:
    import google.genai as genai
    from google.genai.client import Client as GeminiClient
    from google.genai.types import GenerateContentConfig 
except Exception:
    genai = None
    GeminiClient = None
    GenerateContentConfig = None

# Global client instance
GEMINI_CLIENT = None 

# --- AI Configuration ---
AI_CONFIG = {
    "MODEL_NAME": "gemini-2.5-flash",
    "MAX_TOKENS_RESUME_ANALYSIS": 8000, 
    "TEMPERATURE": 0.2
}

# -------------------------
# Client Initialization
# -------------------------
def initialize_gemini_client():
    """Initializes the global Gemini client instance."""
    global GEMINI_CLIENT
    # ... (Initialization logic remains) ...
    if GEMINI_CLIENT is not None:
        return GEMINI_CLIENT

    if GeminiClient is None:
        return None
        
    api_key = os.getenv("GENAI_API_KEY") or getattr(settings, "GENAI_API_KEY", None)
    if not api_key:
        return None

    try:
        GEMINI_CLIENT = GeminiClient(api_key=api_key)
        return GEMINI_CLIENT
    except Exception:
        return None

# -------------------------
# Core Resume Analysis Service (Skills Only)
# -------------------------
def call_gemini_analyze(resume_text, job_spec, extract_funcs):
    """Calls Gemini for a general skill and profile analysis, then enforces database skill IDs."""
    client = initialize_gemini_client()
    
    # Extract necessary functions passed from views/caller
    extract_skills_from_text = extract_funcs['skills']
    simple_skills_heuristic_analysis = extract_funcs['heuristic_fallback']


    # Job spec handling REMOVED entirely, forcing a general analysis
    
    system_instruction = (
        "You are an expert career consultant. Analyze the resume text to identify the user's core competencies "
        "and professional profile. The result must be a single JSON object. "
        "Do not include any matching scores or missing skills, as no job specification is provided. "
        "Focus on extracting skills and providing general strengths and weaknesses."
        '{'
        '"found_skills": [list of extracted skills], '
        '"strengths": [list of general skill-related strengths], '
        '"weaknesses": [list of general skill-related weaknesses], '
        '"suggested_actions": [list of skill development suggestions], '
        '"extracted_data": {'
        '  "skills": [list of skills], '
        '  "education": [], '
        '  "certificates": [], '
        '  "experience": [], '
        '  "summary": "brief professional skill summary"'
        '}'
        '}.'
    )
    # The output schema is also simplified in the analysis service, as 'score' and 'match_strength' are meaningless.

    user_content = f"RESUME_TEXT:\n{resume_text[:10000]}\n\nReturn only JSON."

    if client: 
        try:
            response = client.models.generate_content(
                model=AI_CONFIG["MODEL_NAME"],
                contents=system_instruction + "\n\n" + user_content,
                config=GenerateContentConfig(
                    max_output_tokens=AI_CONFIG["MAX_TOKENS_RESUME_ANALYSIS"],
                    temperature=AI_CONFIG["TEMPERATURE"]
                )
            )
            raw_text = response.text
            
            try:
                json_match = re.search(r"(\{.*\})", raw_text, re.S)
                result = json.loads(json_match.group(1) if json_match else raw_text)
                
                # --- Database Skill Enforcement ---
                if 'extracted_data' not in result:
                    result['extracted_data'] = {}
                
                # CRITICAL: Overwrite AI-extracted skills list with the precise database-matched list
                result['extracted_data']['skills'] = extract_skills_from_text(resume_text)
                
                # Ensure non-skill lists remain empty for consistency
                result['extracted_data']['education'] = []
                result['extracted_data']['certificates'] = []
                result['extracted_data']['experience'] = []

                # Add back required top-level keys for views.py compatibility
                result['score'] = 50 
                result['match_strength'] = "N/A"
                result['missing_skills'] = []
                
                return result
                
            except Exception:
                # Fallback on JSON parsing failure
                return simple_skills_heuristic_analysis(resume_text)
                
        except Exception:
            # Fallback on API call failure
            return simple_skills_heuristic_analysis(resume_text)
    else:
        # Fallback if client initialization failed
        return simple_skills_heuristic_analysis(resume_text)