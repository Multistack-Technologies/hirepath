// src/components/ResumeUploadModal.tsx
'use client'; 

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/Button'; 
import api  from '@/lib/api'; 


interface ResumeFeedback {
  score: number;
  skills_detected: string[];
  missing_skills: string[];
  feedback: string[];
  job_role: string; 
  
}

interface ResumeUploadModalProps {
  isOpen: boolean;        
  onClose: () => void;     
  onUploadSuccess?: (feedback: ResumeFeedback) => void; 
}

export default function ResumeUploadModal({ isOpen, onClose, onUploadSuccess }: ResumeUploadModalProps) {
  // State for managing UI and data
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<ResumeFeedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Optional: Add file type/size validation here
      if (file.size > 5 * 1024 * 1024) { // 5MB limit example
        setUploadError('File size exceeds 5MB. Please select a smaller file.');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setUploadError('Invalid file type. Please upload a PDF or Word document.');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
        return;
      }
      setSelectedFile(file);
      setUploadError(null); // Clear any previous errors
    }
  };

  // Trigger file input click
  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // Handle the file upload process
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', selectedFile); // Append the selected file

    try {
  
      const response = await api.post<ResumeFeedback>('/resumes/analyze/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      // Handle successful upload and feedback
      if (response.data) {
        setFeedback(response.data);
        setUploadSuccess(true);
        // Call the success callback if provided, passing the feedback data
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
     
      } else {
        console.error("API response format for feedback is unexpected:", response);
        setUploadError("Upload successful, but failed to receive feedback: Unexpected response format.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      // Try to get a user-friendly error message from the response
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upload CV. Please try again.';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset modal state when it opens/closes or on success
  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedFile(null);
      setIsUploading(false);
      setUploadError(null);
      setUploadSuccess(false);
      setFeedback(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
    }
  }, [isOpen]); // Depend on isOpen to reset when modal is reopened

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Upload Your CV</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* File Selection Area */}
          {!uploadSuccess ? (
            <>
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx" // Accept PDF and Word documents
                  className="hidden" // Hide the default file input
                />
                <div
                  onClick={handleChooseFile}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition"
                >
                  <p className="text-gray-700">
                    {selectedFile ? selectedFile.name : 'Drag & drop your CV here or click to browse'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>{uploadError}</p>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleUpload}
                  isLoading={isUploading}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload CV'}
                </Button>
              </div>
            </>
          ) : (
            /* Success Message and Feedback */
            <div>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-700">Upload Successful!</h3>
                <p className="text-gray-700 mt-2">Your CV has been analyzed.</p>
              </div>

              {/* Feedback Summary */}
              {feedback && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="text-center mb-3">
                    <p className="text-3xl font-bold text-indigo-700">{feedback.score}<span className="text-lg">/100</span></p>
                    <p className="text-sm text-gray-500">AI-Powered Score</p>
                  </div>
                  
                  {/* Skills Detected */}
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-800 mb-1">Skills Detected</h4>
                    <div className="flex flex-wrap gap-1">
                      {feedback.skills_detected.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-800 mb-1">Missing Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {feedback.missing_skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">AI Suggestions</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      {feedback.feedback.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <Button variant="primary" size="md" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}