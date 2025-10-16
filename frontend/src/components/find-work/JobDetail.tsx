import { Job } from '@/types';
import Button from '@/components/Button';
import GroupText from '@/components/GroupText';
import Image from 'next/image';

interface JobDetailProps {
  job: Job | null;
  onApply: (jobId: number) => void;
}

export default function JobDetail({ job, onApply }: JobDetailProps) {
  if (!job) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-700 text-center py-8">
          Select a job from the list to view details.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4">
      <JobHeader job={job} />
      <JobInfo job={job} />
      <div className="mt-6">
        <Button
          variant="primary"
          size="md"
          onClick={() => onApply(job.id)}
          className="w-full"
        >
          APPLY
        </Button>
      </div>
    </div>
  );
}

function JobHeader({ job }: { job: Job }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
          {/* <Image
            height={40}
            width={40}
            // src={job.company_logo || '/default-company-logo.png'}
            // alt={job.company}
            className="w-10 h-10 rounded-full object-cover"
          /> */}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{job.company}</h2>
          <p className="text-sm text-gray-700">
            {/* {job.title} • {job.department || 'Various Departments'} */}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <ActionButton icon="bookmark" label="Bookmark" />
        <ActionButton icon="info" label="More info" />
      </div>
    </div>
  );
}

function JobInfo({ job }: { job: Job }) {
  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500">
        <span>📍 {job.location}</span>
        <span className="mx-2">•</span>
        <span>{job.employment_type}</span>
      </div>

      <GroupText
        title="Description"
        value={job.description || 'No description available.'}
      />

      {/* <JobSection title="Requirements">
        {job.requirements && job.requirements.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {job.requirements.map((requirement, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs"
              >
                {requirement}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No requirements specified.</p>
        )}
      </JobSection> */}

      {/* <JobSection title="Team">
        <p className="text-sm text-gray-700">{job.department || 'Not specified'}</p>
      </JobSection> */}

      <JobSection title="Salary">
        <p className="text-lg font-bold text-indigo-700">
          {job.salary_range || 'Salary not specified'}
        </p>
      </JobSection>

      <JobSection title="Type">
        <p className="text-sm text-gray-700">{job.employment_type}</p>
      </JobSection>

      <JobSection title="Posted">
        <p className="text-sm text-gray-700">{job.posted_date || 'N/A'}</p>
      </JobSection>
    </div>
  );
}

function JobSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-purple-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function ActionButton({ icon, label }: { icon: string; label: string }) {
  const getIconPath = () => {
    switch (icon) {
      case 'bookmark':
        return 'M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return '';
    }
  };

  return (
    <button
      className="text-gray-500 hover:text-gray-700 transition-colors"
      aria-label={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={getIconPath()}
        />
      </svg>
    </button>
  );
}