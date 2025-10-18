// components/dashboard/StatsSection.tsx
import StatWidget from '@/components/StatWidget';

interface RecruiterStats {
  totalJobs: number;
  activeApplications: number;
  shortlisted: number;
  hired: number;
}

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
        value={stats.activeApplications} 
        color="purple" 
        description="Pending reviews"
      />
      <StatWidget 
        title="Shortlisted" 
        value={stats.shortlisted} 
        color="orange" 
        description="Candidates in review"
      />
      <StatWidget 
        title="Hired" 
        value={stats.hired} 
        color="indigo" 
        description="Successful placements"
      />
    </div>
  );
}