// components/dashboard/GraduateStatsSection.tsx
import StatWidget from '@/components/StatWidget';
import { GraduateStats } from '@/types';


interface GraduateStatsSectionProps {
  stats: GraduateStats;
}

export default function GraduateStatsSection({ stats }: GraduateStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatWidget 
        title="Total Applications" 
        value={stats.totalApplications} 
        color="blue"  
        description="Total applications applied"
      />
      <StatWidget 
        title="Active Applications" 
        value={stats.applicationsByStatus.PENDING} 
        color="purple" 
        description="Your pending applications"
      />
      <StatWidget 
        title="Shortlisted" 
        value={stats.applicationsByStatus.SHORTLISTED} 
        color="orange" 
        description="Applications in review"
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