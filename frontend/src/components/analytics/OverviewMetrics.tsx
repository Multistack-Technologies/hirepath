// components/analytics/OverviewMetrics.tsx
interface OverviewMetricsProps {
  data: {
    total_jobs: number;
    active_jobs: number;
    total_applications: number;
    conversion_rate: number;
    average_match_score: number;
  };
  loading?: boolean;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ data, loading = false }) => {
  const metrics = [
    {
      label: 'Total Jobs',
      value: data.total_jobs,
      description: 'All jobs posted',
    },
    {
      label: 'Active Jobs',
      value: data.active_jobs,
      description: 'Currently open positions',
    },
    {
      label: 'Total Applications',
      value: data.total_applications,
      description: 'All applications received',
    },
    {
      label: 'Conversion Rate',
      value: `${data.conversion_rate}%`,
      description: 'Application to hire ratio',
    },
    {
      label: 'Avg Match Score',
      value: `${data.average_match_score}%`,
      description: 'Average candidate-job match',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-medium text-gray-600 mb-1">{metric.label}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
          <p className="text-xs text-gray-500">{metric.description}</p>
        </div>
      ))}
    </div>
  );
};