// components/dashboard/GraduateDashboard.tsx

import { useGraduateData } from '@/hooks/useGraduateData';
import DashboardError from './DashboardError';
import DashboardLoading from './DashboardLoading';
import { useAuth } from '@/context/AuthContext';
import GraduateStatsSection from './GraduateStatsSection';
import JobsSection from './JobsSection';

export default function GraduateDashboard() {
  const { stats, jobs, isLoading, error, refetch } = useGraduateData();
  const { user } = useAuth();

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.first_name || 'Graduate'}!
        </h1>
        <p className="opacity-90">
          Discover new opportunities and track your application progress.
        </p>
      </div>

      {/* Stats Section */}
      <GraduateStatsSection stats={stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          title="Find Jobs"
          description="Browse available positions"
          href="/Myjobs"
          icon="🔍"
          color="blue"
        />
        <QuickAction
          title="My Applications"
          description="Track your applications"
          href="/applications"
          icon="📋"
          color="green"
        />
        <QuickAction
          title="Profile"
          description="Update your profile"
          href="/profile"
          icon="👤"
          color="purple"
        />
      </div>

      {/* Skills Recommendation (Optional) */}
      <SkillsRecommendation />

      {/* Jobs Section */}
      <JobsSection jobs={jobs} />
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

// Skills Recommendation Component
function SkillsRecommendation() {
  const { user } = useAuth();
  
  // This could be enhanced to show actual skill recommendations
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Boost Your Profile</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Add more skills to your profile to get better job recommendations and increase your chances of getting hired.
          </p>
          <a
            href="/profile?tab=skills"
            className="inline-block mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-800"
          >
            Update your skills →
          </a>
        </div>
      </div>
    </div>
  );
}