import Button from '@/components/Button';

interface ResumeSectionProps {
  resumeScore?: number;
  onUploadClick: () => void;
}

export default function ResumeSection({ resumeScore, onUploadClick }: ResumeSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-700">Resume Rating</h2>
        <Button variant="secondary" size="md" onClick={onUploadClick}>
          UPLOAD CV
        </Button>
      </div>
      
      <div className="text-center mb-4">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full border-4 border-indigo-200 flex items-center justify-center mx-auto">
            <p className="text-3xl font-bold text-indigo-700">
              {resumeScore || 0}<span className="text-lg">/100</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          {resumeScore ? 'Your resume score' : 'Upload your resume to get a score'}
        </p>
        {resumeScore && (
          <div className="text-xs text-gray-500">
            {resumeScore >= 80 && 'Excellent! Your resume is well-optimized.'}
            {resumeScore >= 60 && resumeScore < 80 && 'Good! There is room for improvement.'}
            {resumeScore < 60 && 'Consider improving your resume for better matches.'}
          </div>
        )}
      </div>
    </div>
  );
}