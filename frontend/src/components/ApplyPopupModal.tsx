'use client'; 

import { useState } from 'react';
import Button from '@/components/Button';
import  api  from '@/lib/api';

interface ApplyPopupModalProps {
  isOpen: boolean;   
  onClose: () => void;  
  onApplySuccess: (shortLetter: string) => void; 
  userEmail: string;  
  jobId: number;  
}

export default function ApplyPopupModal({ isOpen, onClose, onApplySuccess, userEmail, jobId }: ApplyPopupModalProps) {
  const [shortLetter, setShortLetter] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Handle the application submission
  const handleApply = async () => {
    if (!shortLetter.trim()) {
      setApplyError('Please write a short letter.');
      return;
    }

    setIsApplying(true);
    setApplyError(null);

    try {
      // Prepare the data to send to the backend
      const applicationData = {
        job: jobId, // Include the job ID
        short_letter: shortLetter, // Include the short letter
        // Add other fields if required by your Django model, e.g., resume: resumeId
      };

      // Send the application data to the Django backend
      // Assuming your endpoint is /api/applications/
      const response = await api.post('/applications/apply/', applicationData);

      // Handle successful application
      console.log("Application submitted successfully!", response.data); // Log for debugging

      // Clear the form
      setShortLetter('');

      // Call the success callback with the short letter
      onApplySuccess(shortLetter);

      // Close the modal after successful submission
      onClose();

    } catch (err: any) {
      console.error("Apply error:", err);
      // Try to get a user-friendly error message from the response
      let errorMessage = 'Failed to submit application. Please try again.';
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.data) {
          // Check for specific error messages in the response data
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.detail) {
             errorMessage = err.response.data.detail;
          } else if (err.response.data.non_field_errors) {
             errorMessage = err.response.data.non_field_errors.join(' ');
          } else if (typeof err.response.data === 'object') {
            // Generic way to stringify field errors if they exist
            errorMessage = Object.entries(err.response.data).map(
              ([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
            ).join('; ') || errorMessage;
          }
        }
        if (err.response.status >= 500) {
           errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message || errorMessage;
      }
      setApplyError(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Short Letter</h2>
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
          {/* User Email */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">{userEmail}</p>
          </div>

          {/* Short Letter Textarea */}
          <div className="mb-4">
            <textarea
              value={shortLetter}
              onChange={(e) => setShortLetter(e.target.value)}
              placeholder="Write a short letter to introduce yourself..."
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 resize-none"
              rows={6}
              disabled={isApplying} // Disable textarea while applying
            ></textarea>
          </div>

          {/* Error Message */}
          {applyError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{applyError}</p>
            </div>
          )}

          {/* Apply Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="md" onClick={onClose} disabled={isApplying}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleApply}
              isLoading={isApplying}
              disabled={!shortLetter.trim() || isApplying}
            >
              {isApplying ? 'Applying...' : 'APPLY'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}