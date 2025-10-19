// components/jobs/JobDetailsHeader.tsx
import Button from '@/components/Button';

interface JobDetailsHeaderProps {
  jobTitle?: string;
  onBack: () => void;
  onEdit?: () => void;
  showEdit?: boolean;
}

export default function JobDetailsHeader({ 
  jobTitle, 
  onBack, 
  onEdit, 
  showEdit = false 
}: JobDetailsHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Job Details</h1>
        {jobTitle && (
          <p className="text-gray-600 mt-1">{jobTitle}</p>
        )}
      </div>
      <div className="flex space-x-3">
        {showEdit && onEdit && (
          <Button variant="secondary" size="md" onClick={onEdit}>
            Edit Job
          </Button>
        )}
        <Button variant="secondary" size="md" onClick={onBack}>
          Back to My Jobs
        </Button>
      </div>
    </div>
  );
}