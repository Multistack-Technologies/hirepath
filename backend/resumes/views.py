# backend/resumes/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
import os
from .models import Resume, CVAnalysis
from .engine import analyze_resume
from .serializers import ResumeUploadSerializer, ResumeFeedbackSerializer 
from rest_framework import permissions
from .recommendation_engine import CareerRecommendationEngine

def create_or_update_cv_analysis(resume_obj, comprehensive_analysis):
    """Create or update CVAnalysis object with comprehensive data"""
    if not comprehensive_analysis:
        return
    
    try:
        personal_insights = comprehensive_analysis.get('personal_insights', {})
        education_analysis = comprehensive_analysis.get('education_analysis', {})
        skills_analysis = comprehensive_analysis.get('skills_analysis', {})
        achievement_metrics = comprehensive_analysis.get('achievement_metrics', {})
        market_fit = comprehensive_analysis.get('market_fit', {})
        
        # Create or update CVAnalysis
        cv_analysis, created = CVAnalysis.objects.update_or_create(
            resume=resume_obj,
            defaults={
                # Personal & Career Insights
                'years_experience': personal_insights.get('years_experience'),
                'career_gap_months': personal_insights.get('career_gap_months', 0),
                'job_stability_score': personal_insights.get('job_stability_score'),
                'career_progression': personal_insights.get('career_progression'),
                
                # Education Analysis
                'education_level': education_analysis.get('education_level', ''),
                'gpa': education_analysis.get('gpa'),
                'qualifications': education_analysis.get('qualifications', []),
                
                # Skills & Competencies
                'technical_skills': skills_analysis.get('technical', []),
                'soft_skills': skills_analysis.get('soft', []),
                'certifications': education_analysis.get('certifications', []),
                
                # Achievement Metrics
                'achievements_count': achievement_metrics.get('count', 0),
                'quantifiable_achievements': achievement_metrics.get('quantifiable', []),
                'leadership_experience': achievement_metrics.get('leadership', False),
                'management_experience': achievement_metrics.get('management', False),
                
                # Market Analysis
                'market_demand_score': market_fit.get('skills_demand_score'),
            }
        )
        return cv_analysis
    except Exception as e:
        print(f"Error creating CVAnalysis for resume {resume_obj.id}: {e}")
        return None

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_and_analyze_resume(request):
    """
    Handle resume upload, trigger AI analysis, and save results.
    Expected data: multipart/form-data with 'file' and optional 'job_role'.
    """
    user = request.user
    
    # 1. Validate incoming data
    serializer = ResumeUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    uploaded_file = request.FILES.get('file')
    job_role = request.data.get('job_role', 'Junior Developer') # Default role

    # 2. Save the uploaded file temporarily or directly
    # Option 1: Save directly to model's file field (handles storage)
    try:
        # Get or create the user's resume object
        resume_obj, created = Resume.objects.update_or_create(
            user=user,
            defaults={'file': uploaded_file}
        )
        
        # 3. Analyze the saved file using the AI engine
        file_path_on_storage = resume_obj.file.name # Get the path where Django saved it
        analysis_result = analyze_resume(file_path_on_storage, job_role)

        if "error" in analysis_result:
             return Response({"error": analysis_result["error"]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4. Save AI results to the model
        resume_obj.score = analysis_result['score']
        resume_obj.skills_detected = analysis_result['skills_detected']
        resume_obj.missing_skills = analysis_result['missing_skills']
        resume_obj.feedback = analysis_result['feedback']
        resume_obj.job_role_matched = analysis_result['job_role_matched']
        
        # Store comprehensive analysis data
        comprehensive_analysis = analysis_result.get('comprehensive_analysis', {})
        resume_obj.analysis_data = comprehensive_analysis
        
        # Save extracted text if available
        if comprehensive_analysis:
            resume_obj.extracted_text = comprehensive_analysis.get('extracted_text', '')
        
        resume_obj.save()

        # 5. Create or update CVAnalysis object
        create_or_update_cv_analysis(resume_obj, comprehensive_analysis)

        # 6. Serialize and return the feedback
        feedback_serializer = ResumeFeedbackSerializer(resume_obj)
        return Response(feedback_serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error processing resume for user {user.id}: {e}")
        return Response(
            {"error": "An error occurred while processing your resume."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_resume_analysis(request):
    """
    Retrieve the latest resume analysis for the authenticated user (graduate).
    """
    user = request.user

    # Ensure the user is a graduate
    if user.role != 'GRADUATE':
        return Response(
            {"error": "Access Denied. This feature is for graduates only."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        # Get the latest resume object for the user
        # Using `latest()` or `order_by('-uploaded_at')[:1].get()` can also work
        latest_resume = Resume.objects.filter(user=user).latest('uploaded_at')

        # Check if the resume object has analysis data
        if latest_resume.score is None:
             return Response(
                {"message": "No analysis data available for your latest resume. Please upload and analyze your CV first."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Serialize the resume object (which contains the saved AI analysis)
        serializer = ResumeFeedbackSerializer(latest_resume)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Resume.DoesNotExist:
        # Handle the case where the user has never uploaded a resume
        return Response(
            {"message": "No resume found. Please upload your CV first."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Error fetching resume analysis for user {user.id}: {e}")
        return Response(
            {"error": "An error occurred while fetching your resume analysis."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# --- End of New GET view ---


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def job_role_recommendations(request):
    """Get personalized job role recommendations"""
    try:
        user = request.user
        engine = CareerRecommendationEngine()
        
        top_n = int(request.GET.get('limit', 10))
        recommendations = engine.recommend_job_roles(user, top_n)
        
        return Response({
            'success': True,
            'recommendations': recommendations,
            'user_skills_count': user.skills.count(),
            'total_job_roles_considered': len(recommendations)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def certificate_recommendations(request):
    """Get personalized certificate recommendations"""
    try:
        user = request.user
        engine = CareerRecommendationEngine()
        
        top_n = int(request.GET.get('limit', 10))
        recommendations = engine.recommend_certificates(user, top_n)
        
        return Response({
            'success': True,
            'recommendations': recommendations,
            'user_certificates_count': user.certificates.count(),
            'total_certificates_considered': len(recommendations)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def career_insights(request):
    """Get comprehensive career insights"""
    try:
        user = request.user
        engine = CareerRecommendationEngine()
        
        insights = engine.get_career_insights(user)
        
        return Response({
            'success': True,
            'insights': insights,
            'user_profile': {
                'total_skills': user.skills.count(),
                'total_experience': user.work_experiences.count(),
                'total_education': user.educations.count(),
                'total_certificates': user.certificates.count(),
                'target_roles_count': user.target_job_roles.count()
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)