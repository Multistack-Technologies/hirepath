// components/jobs/MyJobsHeader.tsx
import Button from '@/components/Button';

interface MyJobsHeaderProps {
  onPostNewVacancy: () => void;
  jobCount: number;
}

export default function MyJobsHeader({ onPostNewVacancy, jobCount }: MyJobsHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
        <p className="text-gray-600 mt-1">
          {jobCount === 0 
            ? "You haven't posted any jobs yet" 
            : `You have ${jobCount} active job${jobCount === 1 ? '' : 's'}`
          }
        </p>
      </div>
      <Button variant="primary" size="md" onClick={onPostNewVacancy}>
        POST NEW VACANCY
      </Button>
    </div>
  );
}