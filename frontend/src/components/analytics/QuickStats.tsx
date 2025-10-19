// components/analytics/QuickStats.tsx
interface QuickStatsProps {
  stats: {
    applications_today: number;
    pending_review: number;
    interviews_scheduled: number;
    new_hires: number;
  };
  loading?: boolean;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, loading = false }) => {
  const statItems = [
    {
      label: 'Applications Today',
      value: stats.applications_today,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      label: 'Pending Review',
      value: stats.pending_review,
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-700',
    },
    {
      label: 'Interviews Scheduled',
      value: stats.interviews_scheduled,
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700',
    },
    {
      label: 'New Hires',
      value: stats.new_hires,
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((stat, index) => (
        <div
          key={index}
          className={`border rounded-lg p-4 ${stat.color}`}
        >
          <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.textColor}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};