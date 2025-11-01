// components/analytics/ReportsList.tsx
import Button from '@/components/Button';
import { Report } from '@/types';

interface ReportsListProps {
  reports: Report[];
  loading: boolean;
  onDownloadReport: (report: Report) => void;
  onViewDetails: (report: Report) => void; // NEW PROP
}

export const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  loading,
  onDownloadReport,
  onViewDetails, // NEW PROP
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatReportType = (reportType: string) => {
    return reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#130160]"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reports generated yet. Create your first report above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
              <p className="text-gray-600 mt-1">{report.description}</p>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Type:</span> {formatReportType(report.report_type)}
                </div>
                <div>
                  <span className="font-medium">Period:</span> {formatDate(report.date_range_start)} - {formatDate(report.date_range_end)}
                </div>
                <div>
                  <span className="font-medium">Generated:</span> {formatDate(report.generated_at)}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 ml-4">
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => onViewDetails(report)}
              >
                View Details
              </Button>
              {report.file_url && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onDownloadReport(report)}
                >
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};