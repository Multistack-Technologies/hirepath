# backend/resumes/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
import os
from .models import Resume
from .engine import analyze_resume # Import the AI engine
from .serializers import ResumeUploadSerializer, ResumeFeedbackSerializer # We'll create these

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
        # Optional: Save extracted text if returned by engine
        # resume_obj.extracted_text = analysis_result.get('extracted_text', '')
        resume_obj.save()

        # 5. Serialize and return the feedback
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