// components/dashboard/GraduateStatsSection.tsx
import StatWidget from '@/components/StatWidget';

interface GraduateStats {
  totalJobs: number;
  activeApplications: number;
  shortlisted: number;
  hired: number;
}

interface GraduateStatsSectionProps {
  stats: GraduateStats;
}

export default function GraduateStatsSection({ stats }: GraduateStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatWidget 
        title="Total Jobs" 
        value={stats.totalJobs} 
        color="blue" 
        description="Available positions"
      />
      <StatWidget 
        title="Active Applications" 
        value={stats.activeApplications} 
        color="purple" 
        description="Your pending applications"
      />
      <StatWidget 
        title="Shortlisted" 
        value={stats.shortlisted} 
        color="orange" 
        description="Applications in review"
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