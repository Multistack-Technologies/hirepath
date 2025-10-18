// components/dashboard/RecruiterDashboard.tsx
import { useRecruiterData } from '@/hooks/useRecruiterData';
import StatsSection from './StatsSection';
import CandidatesSection from './CandidatesSection';
import DashboardError from './DashboardError';
import DashboardLoading from './DashboardLoading';

export default function RecruiterDashboard() {
  const { stats, candidates, isLoading, error, refetch } = useRecruiterData();

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="opacity-90">
          Here's what's happening with your job postings and candidates today.
        </p>
      </div>

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          title="Post a Job"
          description="Create a new job posting"
          href="jobs/post"
          icon="📝"
          color="blue"
        />
        <QuickAction
          title="View Applications"
          description="Review candidate applications"
          href="/graduates"
          icon="👥"
          color="green"
        />
        <QuickAction
          title="Analytics"
          description="View performance insights"
          href="analytics"
          icon="📊"
          color="purple"
        />
      </div>

      {/* Candidates Section */}
      <CandidatesSection candidates={candidates} />
    </div>
  );
}

// Quick Action Component
interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function QuickAction({ title, description, href, icon, color }: QuickActionProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
  };

  return (
    <a
      href={href}
      className={`block p-4 border-2 rounded-lg transition-colors duration-200 ${colorClasses[color]}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </a>
  );
}