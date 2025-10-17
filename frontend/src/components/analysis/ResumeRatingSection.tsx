// components/analysis/ResumeRatingSection.tsx
import Button from '@/components/Button';

interface ResumeRatingSectionProps {
  score: number;
  totalScore: number;
  fileName?: string;
  uploadedAt?: string;
  onUpload: () => void;
}

export default function ResumeRatingSection({ 
  score, 
  totalScore, 
  fileName, 
  uploadedAt, 
  onUpload 
}: ResumeRatingSectionProps) {
  const percentage = (score / totalScore) * 100;
  
  const getRatingColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingText = (percent: number) => {
    if (percent >= 80) return 'Excellent!';
    if (percent >= 60) return 'Good';
    if (percent >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Resume Rating</h2>
      
      {/* Score Display */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full border-4 border-indigo-200 flex items-center justify-center mx-auto mb-3">
            <div className="text-center">
              <p className={`text-3xl font-bold ${getRatingColor(percentage)}`}>
                {score}
              </p>
              <p className="text-sm text-gray-500">out of {totalScore}</p>
            </div>
          </div>
        </div>
        <p className={`text-lg font-semibold ${getRatingColor(percentage)}`}>
          {getRatingText(percentage)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Resume Strength</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              percentage >= 80 ? 'bg-green-500' :
              percentage >= 60 ? 'bg-yellow-500' :
              percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* File Info */}
      <div className="text-sm text-gray-700 space-y-2 mb-6">
        {fileName && (
          <div className="flex justify-between">
            <span className="font-medium">File:</span>
            <span className="text-gray-900">{fileName}</span>
          </div>
        )}
        {uploadedAt && (
          <div className="flex justify-between">
            <span className="font-medium">Uploaded:</span>
            <span className="text-gray-900">
              {new Date(uploadedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <Button
        variant="primary"
        size="md"
        onClick={onUpload}
        className="w-full"
      >
        UPLOAD NEW RESUME
      </Button>

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> {percentage >= 70 ? 
            "Great job! Keep your resume updated with new achievements." :
            "Consider adding more relevant skills and quantifiable achievements."
          }
        </p>
      </div>
    </div>
  );
}