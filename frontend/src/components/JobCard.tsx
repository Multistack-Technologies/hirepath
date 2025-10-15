// src/components/JobCard.tsx
import { Job } from '@/types'; // Assuming you have a Job interface/type defined
import Button from '@/components/Button'; // Your existing Button component
import Link from 'next/link'; // For internal links

interface JobCardProps {
  job: Job; // The job object to display
  onApplyClick?: () => void; // Optional callback for apply button
}

export default function JobCard({ job, onApplyClick }: JobCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="flex items-start">
        {/* Company Logo Placeholder */}
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-4" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900">{job.title}</h3>
              <p className="text-sm text-gray-700">{job.company}, {job.location}</p>
              {/* Optional: Display posted date or salary if available */}
              {/* <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                <span>📍 {job.location}</span>
                <span>•</span>
                <span>{job.posted_at}</span> 
              </div> */}
            </div>
            <div className="ml-4 text-right">
              {/* Optional: Display salary or other info */}
              {/* <div className="text-sm text-gray-500 mb-1">{job.salary}</div> */}
              {/* Optional: Display match score if available from backend */}
              {/* <div className="text-xs text-gray-500">Match: {job.match_score}%</div> */}
            </div>
          </div>
          {/* Optional: Display a short description snippet */}
          {/* <p className="text-sm text-gray-700 mt-2 truncate max-w-md">{job.description.substring(0, 100)}...</p> */}
        </div>
      </div>
      <div className="flex justify-end mt-4 space-x-2">
        {/* Example: View Job Details Button */}
        <Link href={`/jobs/${job.id}`} passHref>
          <Button variant="secondary" size="sm">
            View Details
          </Button>
        </Link>
        {/* Example: Apply Button */}
        {onApplyClick && (
          <Button variant="primary" size="sm" onClick={onApplyClick}>
            Apply
          </Button>
        )}
      </div>
    </div>
  );
}