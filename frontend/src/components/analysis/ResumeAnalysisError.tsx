// components/analysis/ResumeAnalysisError.tsx
import Button from '@/components/Button';

interface ResumeAnalysisErrorProps {
  message: string;
  onRetry: () => void;
  onUpload: () => void;
}

export default function ResumeAnalysisError({ message, onRetry, onUpload }: ResumeAnalysisErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Analysis</h3>
          <p className="text-red-700 mb-4">{message}</p>
          <div className="flex space-x-3">
            <Button variant="primary" size="sm" onClick={onRetry}>
              Try Again
            </Button>
            <Button variant="secondary" size="sm" onClick={onUpload}>
              Upload Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}