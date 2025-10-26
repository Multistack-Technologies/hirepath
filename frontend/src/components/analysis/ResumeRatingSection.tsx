import Button from '@/components/Button';

interface ResumeRatingSectionProps {
  score: number;
  matchStrength: string;
  fileName?: string;
  uploadedAt?: string;
  onUpload: () => void;
  strengths: string[];
  weaknesses: string[];
}

export default function ResumeRatingSection({ 
  score, 
  matchStrength, 
  fileName, 
  uploadedAt, 
  onUpload,
  strengths,
  weaknesses
}: ResumeRatingSectionProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'high': return '🎯';
      case 'medium': return '📊';
      case 'low': return '📈';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Resume Rating</h2>
      
      {/* Score Display */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Overall Score</div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStrengthColor(matchStrength)}`}>
              <span className="mr-1">{getStrengthIcon(matchStrength)}</span>
              {matchStrength.charAt(0).toUpperCase() + matchStrength.slice(1)} Match
            </span>
          </div>
        </div>
      </div>

      {/* File Info */}
      {fileName && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 text-sm">Analyzed File</p>
              <p className="text-gray-600 text-sm truncate">{fileName}</p>
              {uploadedAt && (
                <p className="text-gray-500 text-xs mt-1">
                  Uploaded {formatDate(uploadedAt)}
                </p>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={onUpload}>
              Re-upload
            </Button>
          </div>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium text-green-700 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-red-700 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <span className="text-red-500 mr-2 mt-0.5">⚠</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quick Tips to Improve
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Add missing technical skills to your profile</li>
          <li>• Include quantifiable achievements in your experience</li>
          <li>• Consider recommended certificates for skill gaps</li>
          <li>• Update your resume with recent projects</li>
        </ul>
      </div>
    </div>
  );
}