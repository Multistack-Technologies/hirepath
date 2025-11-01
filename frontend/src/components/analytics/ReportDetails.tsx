// components/analytics/ReportDetails.tsx
import { useState } from 'react';
import Button from '@/components/Button';
import { Report } from '@/types';

interface ReportDetailsProps {
  report: Report;
  onClose: () => void;
  onDownload: (report: Report) => void;
  onExportReport: (reportId: number, format: string) => Promise<void>;
}

export const ReportDetails: React.FC<ReportDetailsProps> = ({
  report,
  onClose,
  onDownload,
  onExportReport,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'metrics'>('overview');
  const [exporting, setExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReportType = (reportType: string) => {
    return reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleExport = async (format: string) => {
    try {
      setExporting(true);
      await onExportReport(report.id, format);
      setShowExportDropdown(false);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setExporting(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Report Information</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Report Type:</dt>
              <dd className="font-medium">{formatReportType(report.report_type)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Date Range:</dt>
              <dd className="font-medium">
                {formatDate(report.date_range_start)} - {formatDate(report.date_range_end)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Generated:</dt>
              <dd className="font-medium">{formatDate(report.generated_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Last Accessed:</dt>
              <dd className="font-medium">{formatDate(report.last_accessed)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Export Status</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Export Format:</dt>
              <dd className="font-medium">{report.export_format || 'Not exported'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Export Status:</dt>
              <dd className="font-medium">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  report.is_exported 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.is_exported ? 'Exported' : 'Not Exported'}
                </span>
              </dd>
            </div>
            {report.filters_applied && Object.keys(report.filters_applied).length > 0 && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Filters Applied:</dt>
                <dd className="font-medium">{Object.keys(report.filters_applied).length}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {report.description && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Description</h4>
          <p className="text-blue-800 text-sm">{report.description}</p>
        </div>
      )}

      {report.filters_applied && Object.keys(report.filters_applied).length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Applied Filters</h4>
          <div className="space-y-1 text-sm">
            {Object.entries(report.filters_applied).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-yellow-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium text-yellow-900">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDataView = () => {
    if (!report.report_data || Object.keys(report.report_data).length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No data available for this report.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(report.report_data).map(([section, data]) => (
          <div key={section} className="border rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h4 className="font-medium text-gray-900 capitalize">
                {section.replace(/_/g, ' ')}
              </h4>
            </div>
            <div className="p-4">
              {typeof data === 'object' && data !== null ? (
                <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-gray-700">{String(data)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMetrics = () => {
    if (!report.report_data) {
      return (
        <div className="text-center py-8 text-gray-500">
          No metrics data available.
        </div>
      );
    }

    // Extract metrics from report data
    const metrics = extractMetrics(report.report_data);

    return (
      <div className="space-y-6">
        {metrics.map((metricGroup, index) => (
          <div key={index} className="border rounded-lg">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h4 className="font-medium text-gray-900 capitalize">
                {metricGroup.title}
              </h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metricGroup.metrics.map((metric, metricIndex) => (
                  <div
                    key={metricIndex}
                    className="bg-white border border-gray-200 rounded-lg p-4 text-center"
                  >
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </p>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const extractMetrics = (reportData: any) => {
    const metrics = [];

    // Summary metrics
    if (reportData.summary) {
      metrics.push({
        title: 'Summary',
        metrics: [
          { label: 'Total Applications', value: reportData.summary.total_applications || 0 },
          { label: 'Average Match Score', value: `${reportData.summary.average_match_score || 0}%` },
        ]
      });
    }

    // Quality metrics
    if (reportData.quality_metrics) {
      metrics.push({
        title: 'Quality Metrics',
        metrics: [
          { label: 'High Quality', value: reportData.quality_metrics.high_quality || 0 },
          { label: 'Medium Quality', value: reportData.quality_metrics.medium_quality || 0 },
          { label: 'Low Quality', value: reportData.quality_metrics.low_quality || 0 },
        ]
      });
    }

    // Time metrics
    if (reportData.time_metrics) {
      metrics.push({
        title: 'Time to Hire',
        metrics: [
          { label: 'Average Days to Hire', value: reportData.time_metrics.average_time_to_hire || 0 },
          { label: 'Total Hires', value: reportData.time_metrics.total_hires || 0 },
        ]
      });
    }

    return metrics;
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50 text-gray-800">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
            <p className="text-gray-600 mt-1">
              {formatReportType(report.report_type)} • {formatDate(report.generated_at)}
            </p>
          </div>
          <div className="flex space-x-3">
            {/* Export Dropdown */}
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={exporting}
              >
                {exporting ? 'Exporting...' : 'Export Report'}
              </Button>
              
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    {['PDF', 'EXCEL', 'CSV', 'JSON'].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        disabled={exporting}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Export as {format}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {report.file_url && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onDownload(report)}
              >
                Download
              </Button>
            )}
            <Button
              variant="tertiary"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'metrics', label: 'Metrics' },
              { id: 'data', label: 'Raw Data' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#130160] text-[#130160]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'metrics' && renderMetrics()}
          {activeTab === 'data' && renderDataView()}
        </div>
      </div>
    </div>
  );
};