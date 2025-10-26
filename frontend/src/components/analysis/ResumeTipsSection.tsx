import Button from '@/components/Button';
import { useState } from 'react';

interface ResumeTipsSectionProps {
  onAddCertificates: () => void;
  suggestedActions: string[];
}

export default function ResumeTipsSection({ onAddCertificates, suggestedActions }: ResumeTipsSectionProps) {
  const [playingVideo, setPlayingVideo] = useState(false);

  const resumeTips = [
    "Use action verbs to start each bullet point",
    "Quantify your achievements with numbers",
    "Tailor your resume for each job application",
    "Keep it to one page if you have less than 10 years of experience",
    "Use a clean, professional layout",
    "Include relevant keywords from the job description",
    "Proofread for spelling and grammar errors",
    "Highlight your most recent and relevant experience",
    "Include both hard and soft skills",
    "Add a professional summary at the top"
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">
        Resume Writing Tips & Ideas
      </h2>

      {/* Suggested Actions */}
      {suggestedActions && suggestedActions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-indigo-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Recommended Actions
          </h3>
          <div className="space-y-2">
            {suggestedActions.map((action, index) => (
              <div key={index} className="flex items-start text-sm bg-indigo-50 p-3 rounded-lg">
                <span className="text-indigo-600 mr-2 mt-0.5">•</span>
                <span className="text-indigo-800">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Section */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-gray-800">Top 10 Resume Writing Tips for 2024</span>
        </div>
        
        <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
          {!playingVideo ? (
            <div className="flex items-center justify-center h-full bg-gray-900">
              <button
                onClick={() => setPlayingVideo(true)}
                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors"
                aria-label="Play resume tips video"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-white text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Video would play here</p>
                <p className="text-xs text-gray-400 mt-1">(Video integration placeholder)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips List */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-800 mb-3">Quick Tips</h3>
        <div className="grid grid-cols-1 gap-2">
          {resumeTips.slice(0, 5).map((tip, index) => (
            <div key={index} className="flex items-start text-sm">
              <span className="text-green-500 mr-2 mt-0.5">✓</span>
              <span className="text-gray-700">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates Section */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-800">Boost Your Resume</h3>
          <Button variant="primary" size="sm" onClick={onAddCertificates}>
            Add Certificates
          </Button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Adding relevant certificates can increase your resume score by up to 15%.
        </p>
        
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium">Certificates to consider:</p>
              <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                <li>Industry-specific certifications</li>
                <li>Software proficiency certificates</li>
                <li>Project management certifications</li>
                <li>Language proficiency certificates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}