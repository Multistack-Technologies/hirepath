// app/analytics/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Alert } from '@/components/analytics/Alert';
import { ReportGenerationForm } from '@/components/analytics/ReportGenerationForm';
import { ReportsList } from '@/components/analytics/ReportsList';
import { ExportSection } from '@/components/analytics/ExportSection';
import { QuickStats } from '@/components/analytics/QuickStats';
import { OverviewMetrics } from '@/components/analytics/OverviewMetrics';
import { TopPerformingJobs } from '@/components/analytics/TopPerformingJobs';
import { ReportDetails } from '@/components/analytics/ReportDetails';

export default function ReportsPage() {
  const {
    reports,
    exports,
    dashboardData,
    loading,
    error,
    success,
    selectedReport,
    fetchReports,
    generateReport,
    fetchExports,
    requestExport,
    downloadExport,
    fetchDashboardData,
    exportReport, // NEW
    viewReportDetails,
    closeReportDetails,
    clearError,
    clearSuccess,
  } = useAnalytics();

  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchReports();
    fetchExports();
    fetchDashboardData(timeRange);
  }, [fetchReports, fetchExports, fetchDashboardData, timeRange]);

  const handleDownloadReport = (report: any) => {
    if (report.file_url) {
      window.open(report.file_url, '_blank');
    }
  };

  const handleViewDetails = (report: any) => {
    viewReportDetails(report);
  };

  const handleExportReport = async (reportId: number, format: string) => {
    await exportReport(reportId, format);
  };

  return (
    <DashboardLayout
      pageTitle="Analytics & Reports"
      pageDescription="Monitor recruitment performance and generate detailed reports"
    >
      <div className="space-y-8">
        {/* Alerts */}
        {error && <Alert type="error" message={error} onClose={clearError} />}
        {success && <Alert type="success" message={success} onClose={clearSuccess} />}

        {/* Time Range Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-600">
                {dashboardData?.period || `Last ${timeRange} days`}
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#130160] focus:border-[#130160]"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats
          stats={dashboardData?.quick_stats || {
            applications_today: 0,
            pending_review: 0,
            interviews_scheduled: 0,
            new_hires: 0
          }}
          loading={loading && !dashboardData}
        />

        {/* Overview Metrics */}
        {dashboardData && (
          <OverviewMetrics
            data={{
              total_jobs: dashboardData.total_jobs,
              active_jobs: dashboardData.active_jobs,
              total_applications: dashboardData.total_applications,
              conversion_rate: dashboardData.conversion_rate,
              average_match_score: dashboardData.average_match_score,
            }}
            loading={loading && !dashboardData}
          />
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Performing Jobs */}
          <div className="lg:col-span-1">
            <TopPerformingJobs
              jobs={dashboardData?.top_performing_jobs || []}
              loading={loading && !dashboardData}
            />
          </div>

          {/* Applications Trend */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications Trend</h3>
            {dashboardData?.applications_trend && dashboardData.applications_trend.length > 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chart visualization would go here</p>
                <p className="text-sm text-gray-400 mt-2">
                  {dashboardData.applications_trend.length} data points available
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No application trend data available yet.</p>
            )}
          </div>
        </div>

        {/* Report Generation Section */}
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Report</h2>
          <ReportGenerationForm onSubmit={generateReport} loading={loading} />
        </section>

        {/* Generated Reports Section */}
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Reports</h2>
          <ReportsList
            reports={reports}
            loading={loading}
            onDownloadReport={handleDownloadReport}
            onViewDetails={handleViewDetails}
          />
        </section>

        {/* Data Exports Section */}
        <section className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Exports</h2>
          <ExportSection
            exports={exports}
            loading={loading}
            onRequestExport={requestExport}
            onDownloadExport={downloadExport}
          />
        </section>

        {/* Report Details Modal */}
        {selectedReport && (
          <ReportDetails
            report={selectedReport}
            onClose={closeReportDetails}
            onDownload={handleDownloadReport}
            onExportReport={handleExportReport}
          />
        )}
      </div>
    </DashboardLayout>
  );
}