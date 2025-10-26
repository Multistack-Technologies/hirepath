import os
import json
import logging
import time
import hashlib
from typing import Dict, List, Any, Optional
from functools import wraps

from django.core.cache import cache 
from django.conf import settings

# Attempt to import Google GenAI SDK
try:
    import google.genai as genai
    from google.genai.client import Client as GeminiClient
    # Note: Import GenerateContentConfig for the config object
    from google.genai.types import GenerateContentConfig 
except Exception as e:
    logging.getLogger(__name__).error(
        f"FATAL: Gemini SDK import failed due to: {type(e).__name__}: {str(e)}"
    )
    genai = None
    GeminiClient = None
    GenerateContentConfig = None

logger = logging.getLogger(__name__)

def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    """
    Decorator for retrying failed API calls with exponential backoff.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        sleep_time = delay * (2 ** attempt)  # Exponential backoff
                        logger.warning(
                            f"Attempt {attempt + 1}/{max_retries} failed. "
                            f"Retrying in {sleep_time}s. Error: {str(e)}"
                        )
                        time.sleep(sleep_time)
                    else:
                        logger.error(f"All {max_retries} attempts failed. Last error: {str(e)}")
            # Only raise if all attempts failed
            if last_exception is not None:
                raise last_exception
        return wrapper
    return decorator

class GeminiAnalysisEngine:
    """
    AI Engine using Google's Gemini for analyzing job applications
    with enhanced features, robustness, manual caching, and safety handling.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = self._load_config(config)
        self.model: Optional[GeminiClient] = None 
        self._initialize_client()
    
    def _load_config(self, config: Dict) -> Dict:
        """Load configuration with defaults"""
        default_config = {
            # FIX 3: Changed model name to use the current recommended alias.
            'model_name': 'gemini-2.5-flash', 
            'temperature': 0.3,
            'max_tokens': 8192,
            'weights': {
                'skills': 0.6, 
                'education': 0.25, 
                'certifications': 0.15
            },
            'timeout': 30,
            'max_retries': 3,
            'retry_delay': 1.0,
            'cache_timeout': 60 * 60 * 24, # 24 hours
            'enable_caching': True,
        }
        return {**default_config, **(config or {})}
    
    def _initialize_client(self):
        """
        Initialize Gemini client using the modern Client class pattern.
        """
        if genai is None or GeminiClient is None:
            logger.warning("Gemini SDK not installed/imported. AI features will be disabled.")
            self.model = None
            return 

        try:
            api_key = os.getenv('GENAI_API_KEY') or getattr(settings, 'GENAI_API_KEY', None)
            if not api_key:
                logger.warning("Gemini API key not found. AI features will be disabled.")
                return
            
            self.model = GeminiClient(api_key=api_key)
            logger.info("Gemini client initialized successfully using GeminiClient.")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            self.model = None
    
    def health_check(self) -> Dict[str, Any]:
        """Check if the AI service is healthy"""
        status = {
            'ai_service_available': self.model is not None,
            'api_key_configured': bool(
                os.getenv('GENAI_API_KEY') or getattr(settings, 'GENAI_API_KEY', None)
            ),
            'fallback_mode': self.model is None,
            'timestamp': time.time()
        }
        
        if self.model and GenerateContentConfig:
            try:
                test_response = self.model.models.generate_content(
                    model=self.config['model_name'], 
                    contents="Respond with exactly 'OK'",
                    config=GenerateContentConfig( 
                        temperature=0.1,
                        max_output_tokens=10,
                    )
                )
                status['api_connectivity'] = test_response.text.strip() == 'OK'
                status['response_time'] = 'test_completed'
            except Exception as e:
                status['api_connectivity'] = False
                status['error'] = str(e)
        
        return status
    
    def _generate_cache_key(self, applicant_data: Dict, job_data: Dict, cover_letter: str) -> str:
        """Generate unique, hashable cache key for the analysis"""
        data_string = json.dumps(applicant_data, sort_keys=True) + \
                      json.dumps(job_data, sort_keys=True) + cover_letter
        
        prefix = 'gemini_analysis_'
        return prefix + hashlib.md5(data_string.encode()).hexdigest()
    
    def analyze_application_match(self, applicant_data: Dict, job_data: Dict, cover_letter: str = "") -> Dict[str, Any]:
        """
        Analyze job application match using Gemini AI with integrated manual caching.
        """
        log_context = {
            'job_title': job_data.get('title', 'Unknown'),
            'applicant_skills_count': len(applicant_data.get('skills', [])),
            'ai_enabled': self.model is not None
        }
        
        logger.info("Starting job application analysis", extra=log_context)
        
        cache_key = None
        if self.config['enable_caching']:
            try:
                cache_key = self._generate_cache_key(applicant_data, job_data, cover_letter)
                cached_result = cache.get(cache_key)
                
                if cached_result:
                    logger.info("Returning result from cache.", extra=log_context)
                    return cached_result
            except Exception as e:
                logger.error(f"Caching failed (read): {e}")

        # Perform the actual analysis
        result = self._analyze_application_match_impl(applicant_data, job_data, cover_letter, log_context)

        if self.config['enable_caching'] and cache_key:
            try:
                cache.set(cache_key, result, timeout=self.config['cache_timeout'])
            except Exception as e:
                logger.error(f"Caching failed (write): {e}")

        return result
        
    def _analyze_application_match_impl(self, applicant_data: Dict, job_data: Dict, cover_letter: str, log_context: Dict) -> Dict[str, Any]:
        """Implementation of core analysis logic"""
        if not self.model:
            logger.warning("Using fallback analysis engine", extra=log_context)
            return self._generate_fallback_analysis(applicant_data, job_data)
        
        try:
            prompt = self._create_analysis_prompt(applicant_data, job_data, cover_letter)
            response_text = self._get_ai_response(prompt) # This might raise an exception
            
            if response_text:
                result = self._parse_ai_response(response_text)
                
                if not self._validate_ai_response(result):
                    logger.warning("AI response validation failed, using fallback", extra=log_context)
                    return self._generate_fallback_analysis(applicant_data, job_data)
                
                log_context['match_score'] = result.get('match_score', 0)
                logger.info("Analysis completed successfully", extra=log_context)
                return result
            else:
                logger.error("Empty response from AI service (likely safety block), using fallback", extra=log_context)
                return self._generate_fallback_analysis(applicant_data, job_data)
                
        except Exception as e:
            # This block now catches the failure from _get_ai_response after all retries
            logger.error(f"Gemini analysis failed: {e}", extra=log_context, exc_info=True)
            return self._generate_fallback_analysis(applicant_data, job_data)
    
    def _create_analysis_prompt(self, applicant_data: Dict, job_data: Dict, cover_letter: str) -> str:
        """Create prompt for Gemini analysis"""
        
        prompt = f"""
        Analyze this job application match for a South African IT role and provide a JSON response.

        JOB REQUIREMENTS:
        Title: {job_data.get('title', 'N/A')}
        Description: {job_data.get('description', 'N/A')}
        Required Skills: {', '.join(job_data.get('skills_required', []))}
        Experience Level: {job_data.get('experience_level', 'N/A')}
        Preferred Education: {', '.join(job_data.get('courses_preferred', []))}
        Preferred Certificates: {', '.join(job_data.get('certificates_preferred', []))}

        APPLICANT PROFILE:
        Skills: {', '.join(applicant_data.get('skills', []))}
        Education: {json.dumps(applicant_data.get('educations', []), indent=2)}
        Work Experience: {json.dumps(applicant_data.get('experiences', []), indent=2)}
        Certificates: {json.dumps(applicant_data.get('certificates', []), indent=2)}
        Cover Letter: {cover_letter or 'Not provided'}

        TASK:
        Calculate a match score (0-100) considering ONLY:
        - Skills alignment ({self.config['weights']['skills']*100:.0f}% weight)
        - Education match ({self.config['weights']['education']*100:.0f}% weight) 
        - Certifications ({self.config['weights']['certifications']*100:.0f}% weight)

        Provide detailed analysis and actionable feedback for the South African IT job market.

        IMPORTANT: Respond ONLY with valid JSON in this exact format:
        {{
            "match_score": 85.5,
            "analysis": {{
                "skills_assessment": {{
                    "matched_skills": ["Python", "AWS", "Django"],
                    "missing_skills": ["Kubernetes", "Docker"],
                    "strength_rating": "high",
                    "match_percentage": 75
                }},
                "education_assessment": {{
                    "qualification_match": true,
                    "relevant_degrees": ["BSc Computer Science"],
                    "match_quality": "excellent"
                }},
                "certification_assessment": {{
                    "relevant_certifications": ["AWS Certified"],
                    "missing_certifications": ["Microsoft Azure"],
                    "certification_score": 80
                }}
            }},
            "feedback": "Specific, actionable feedback focusing on South African IT market needs...",
            "confidence_score": 0.95
        }}

        Do not include any other text outside the JSON structure.
        """
        return prompt
    
    @retry_on_failure(max_retries=3, delay=1.0)
    def _get_ai_response(self, prompt: str) -> Optional[str]:
        """
        Get response from Gemini API with retry logic, safety settings,
        and enhanced error checking for empty responses.
        """
        if not self.model or not GenerateContentConfig:
             raise Exception("Gemini client not initialized or configuration type missing.")
             
        try:
            # FIX 1 & 2: Define safety settings in the correct LIST of DICTS format,
            # and pass them inside the config object.
            safety_settings = [
                {'category': 'HARM_CATEGORY_HATE_SPEECH', 'threshold': 'BLOCK_NONE'},
                {'category': 'HARM_CATEGORY_HARASSMENT', 'threshold': 'BLOCK_NONE'},
                {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold': 'BLOCK_NONE'},
                {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold': 'BLOCK_NONE'},
            ]

            response = self.model.models.generate_content( 
                model=self.config['model_name'], 
                contents=prompt,
                config=GenerateContentConfig( 
                    temperature=self.config['temperature'],
                    max_output_tokens=self.config['max_tokens'],
                    safety_settings=safety_settings
                )
            )
            
            # Check for blocks *before* accessing .text
            if not response.candidates:
                if hasattr(response, 'prompt_feedback'):
                    logger.error(f"Gemini prompt blocked. Reason: {response.prompt_feedback.block_reason}")
                else:
                    logger.error("Gemini returned no candidates (prompt likely blocked).")
                return None 

            finish_reason = response.candidates[0].finish_reason
            
            if finish_reason.name != "STOP":
                logger.error(f"Gemini response generation stopped. Reason: {finish_reason.name}")
                if hasattr(response.candidates[0], 'safety_ratings'):
                     logger.error(f"Safety Ratings: {response.candidates[0].safety_ratings}")
                return None 
            
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            raise  # Re-raise for the retry decorator
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse Gemini response into structured data"""
        try:
            cleaned_response = response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.startswith('```'):
                cleaned_response = cleaned_response[3:]
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3]
            
            start_idx = cleaned_response.find('{')
            end_idx = cleaned_response.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                logger.error("No JSON found in Gemini response")
                return self._generate_fallback_analysis({}, {})
            
            json_str = cleaned_response[start_idx:end_idx]
            parsed_data = json.loads(json_str)
            
            return parsed_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            logger.error(f"Raw response: {response}")
            return self._generate_fallback_analysis({}, {})
    
    def _validate_ai_response(self, parsed_data: Dict) -> bool:
        """Validate the structure of AI response"""
        required_fields = {
            'match_score': (float, int),
            'analysis': dict,
            'feedback': str
        }
        
        for field, expected_type in required_fields.items():
            if field not in parsed_data:
                logger.error(f"Missing required field in AI response: {field}")
                return False
            if not isinstance(parsed_data[field], expected_type):
                logger.error(f"Invalid type for field {field}. Expected {expected_type}, got {type(parsed_data[field])}")
                return False
        
        analysis = parsed_data.get('analysis', {})
        required_sections = ['skills_assessment', 'education_assessment', 'certification_assessment']
        
        for section in required_sections:
            if section not in analysis:
                logger.error(f"Missing analysis section: {section}")
                return False
        
        match_score = parsed_data.get('match_score', 0)
        if not (0 <= match_score <= 100):
            logger.error(f"Match score out of range: {match_score}")
            return False
        
        return True
    
    def _generate_fallback_analysis(self, applicant_data: Dict, job_data: Dict) -> Dict[str, Any]:
        """Generate fallback analysis when AI is unavailable"""
        logger.info("Using fallback analysis engine")
        
        skills_match = self._calculate_enhanced_skills_match(
            applicant_data.get('skills', []),
            job_data.get('skills_required', [])
        )
        
        education_match = self._calculate_education_match(
            applicant_data.get('educations', []),
            job_data.get('courses_preferred', [])
        )
        
        certification_match = self._calculate_certification_match(
            applicant_data.get('certificates', []),
            job_data.get('certificates_preferred', [])
        )
        
        weights = self.config['weights']
        match_score = (
            skills_match * weights['skills'] + 
            education_match * weights['education'] + 
            certification_match * weights['certifications']
        ) * 100 
        
        return {
            "match_score": round(match_score, 2),
            "analysis": {
                "skills_assessment": {
                    "matched_skills": list(set(applicant_data.get('skills', [])).intersection(
                        set(job_data.get('skills_required', []))
                    )),
                    "missing_skills": list(set(job_data.get('skills_required', [])).difference(
                        set(applicant_data.get('skills', []))
                    )),
                    "strength_rating": "high" if skills_match >= 0.7 else "medium" if skills_match >= 0.4 else "low",
                    "match_percentage": int(skills_match * 100)
                },
                "education_assessment": {
                    "qualification_match": education_match > 0.5,
                    "relevant_degrees": [edu.get('degree', '') for edu in applicant_data.get('educations', [])],
                    "match_quality": "excellent" if education_match >= 0.8 else "good" if education_match >= 0.6 else "moderate" if education_match >= 0.4 else "poor"
                },
                "certification_assessment": {
                    "relevant_certifications": [cert.get('name', '') for cert in applicant_data.get('certificates', [])],
                    "missing_certifications": job_data.get('certificates_preferred', []),
                    "certification_score": int(certification_match * 100)
                }
            },
            "feedback": self._generate_fallback_feedback(applicant_data, job_data, match_score),
            "confidence_score": 0.5,
            "fallback_used": True
        }
    
    def _calculate_enhanced_skills_match(self, applicant_skills: List[str], job_skills: List[str]) -> float:
        """Enhanced skills matching with partial matches"""
        if not job_skills:
            return 0.5
        
        applicant_skills = [s.lower().strip() for s in applicant_skills]
        job_skills = [s.lower().strip() for s in job_skills]
        
        exact_matches = set(applicant_skills).intersection(set(job_skills))
        
        partial_matches = 0
        for job_skill in job_skills:
            if job_skill in exact_matches:
                continue
                
            for app_skill in applicant_skills:
                if app_skill in exact_matches:
                    continue
                    
                if (job_skill in app_skill or app_skill in job_skill or
                    (job_skill.split() and app_skill.split() and job_skill.split()[0] == app_skill.split()[0])):
                    partial_matches += 0.3
                    break
        
        total_score = len(exact_matches) + partial_matches
        return min(total_score / len(job_skills), 1.0)
    
    def _calculate_education_match(self, applicant_educations: List[Dict], preferred_courses: List[str]) -> float:
        """Calculate education match percentage"""
        if not preferred_courses:
            return 0.5
        
        if not applicant_educations:
            return 0.0
        
        # Note: 'applicant_data' was not defined here, using the function parameter
        applicant_degrees = set(edu.get('degree', '').lower() for edu in applicant_educations if edu.get('degree'))
        preferred_degrees_set = set(course.lower() for course in preferred_courses)
        
        if not preferred_degrees_set:
             return 0.5 # Avoid division by zero
             
        match_count = len(applicant_degrees.intersection(preferred_degrees_set))
        return match_count / len(preferred_degrees_set)
    
    def _calculate_certification_match(self, applicant_certificates: List[Dict], preferred_certificates: List[str]) -> float:
        """Calculate certification match percentage"""
        if not preferred_certificates:
            return 0.5
        
        if not applicant_certificates:
            return 0.0
        
        applicant_cert_names = set(cert.get('name', '').lower() for cert in applicant_certificates if cert.get('name'))
        preferred_certs_set = set(cert.lower() for cert in preferred_certificates)
        
        if not preferred_certs_set:
            return 0.5 # Avoid division by zero
            
        match_count = len(applicant_cert_names.intersection(preferred_certs_set))
        return match_count / len(preferred_certs_set)
    
    def _generate_fallback_feedback(self, applicant_data: Dict, job_data: Dict, match_score: float) -> str:
        """Generate fallback feedback with South African context"""
        feedback_parts = []
        
        applicant_skills = set(s.lower() for s in applicant_data.get('skills', []))
        job_skills = set(s.lower() for s in job_data.get('skills_required', []))
        
        matched_skills = applicant_skills.intersection(job_skills)
        missing_skills = job_skills.difference(applicant_skills)
        
        if matched_skills:
            feedback_parts.append(f"Strong technical match on: {', '.join(list(matched_skills)[:3])}")
        
        if missing_skills:
            feedback_parts.append(f"Consider developing these in-demand SA skills: {', '.join(list(missing_skills)[:3])}")
        
        sa_hot_skills = {'aws', 'azure', 'python', 'javascript', 'react', 'node.js', 'docker', 'kubernetes', 'devops', 'cloud'}
        missing_hot_skills = missing_skills.intersection(sa_hot_skills)
        
        if missing_hot_skills:
            feedback_parts.append(f"These are high-demand skills in South Africa: {', '.join(list(missing_hot_skills))}")
        
        if match_score >= 80:
            feedback_parts.append("Excellent match for South African IT roles!")
        elif match_score >= 60:
            feedback_parts.append("Good potential for SA market with some skill development.")
        else:
            feedback_parts.append("Focus on developing core technical skills needed in South Africa.")
        
        return " ".join(feedback_parts)
    
    def clear_cache(self):
        """
        Clears the Django cache.
        """
        cache.clear()
        logger.info("Analysis cache cleared (Global Django cache cleared)")

# Global instance for reuse
ai_engine = GeminiAnalysisEngine()