// components/dashboard/StatsSection.tsx
import StatWidget from '@/components/StatWidget';
import { RecruiterStats } from '@/types';



interface StatsSectionProps {
  stats: RecruiterStats;
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatWidget 
        title="Total Jobs" 
        value={stats.totalJobs} 
        color="blue" 
        description="Active job postings"
      />
      <StatWidget 
        title="Active Applications" 
        value={stats.applicationsByStatus.PENDING} 
        color="purple" 
        description="Pending reviews"
      />
      <StatWidget 
        title="Shortlisted" 
        value={stats.applicationsByStatus.SHORTLISTED} 
        color="orange" 
        description="Candidates in review"
      />
      <StatWidget 
        title="Hired" 
        value={stats.applicationsByStatus.ACCEPTED} 
        color="indigo" 
        description="Successful placements"
      />
    </div>
  );
}