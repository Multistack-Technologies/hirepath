// hooks/useAnalytics.ts
import { useState, useCallback } from "react";
import { analyticsService } from "@/services/analyticsService";
import {
  Report,
  Export,
  GenerateReportData,
  ExportRequestData,
  DashboardData,
} from "@/types";

interface UseAnalyticsReturn {
  // State
  reports: Report[];
  exports: Export[];
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  success: string | null;

  // Actions
  fetchReports: () => Promise<void>;
  generateReport: (data: GenerateReportData) => Promise<void>;
  fetchExports: () => Promise<void>;
  requestExport: (data: ExportRequestData) => Promise<void>;
  downloadExport: (exportId: number) => Promise<void>;
  fetchDashboardData: (days?: number) => Promise<void>;

  // Utilities
  clearError: () => void;
  clearSuccess: () => void;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [reports, setReports] = useState<Report[]>([]);
  const [exports, setExports] = useState<Export[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Error and success management
  const setErrorWithTimeout = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  const setSuccessWithTimeout = useCallback((message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  }, []);

  const fetchDashboardData = useCallback(
    async (days: number = 30) => {
      try {
        setLoading(true);
        const data = await analyticsService.getDashboardOverview(days);
        setDashboardData(data);
      } catch (err) {
        const errorMessage = analyticsService.getErrorMessage(err);
        setErrorWithTimeout(errorMessage);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    },
    [setErrorWithTimeout]
  );
  // Reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getReports();
      setReports(data);
    } catch (err) {
      setErrorWithTimeout("Failed to fetch reports");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  }, [setErrorWithTimeout]);

  const generateReport = useCallback(
    async (data: GenerateReportData) => {
      try {
        setLoading(true);
        setError(null);

        const result = await analyticsService.generateReport(data);

        if (result.success) {
          setSuccessWithTimeout("Report generated successfully!");
          await fetchReports(); // Refresh the list
        } else {
          throw new Error(result.error || "Failed to generate report");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate report";
        setErrorWithTimeout(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchReports, setErrorWithTimeout, setSuccessWithTimeout]
  );

  // Exports
  const fetchExports = useCallback(async () => {
    try {
      const data = await analyticsService.getExports();
      setExports(data);
    } catch (err) {
      setErrorWithTimeout("Failed to fetch exports");
      console.error("Error fetching exports:", err);
    }
  }, [setErrorWithTimeout]);

  const requestExport = useCallback(
    async (data: ExportRequestData) => {
      try {
        setLoading(true);
        setError(null);

        const result = await analyticsService.requestExport(data);

        if (result.success) {
          setSuccessWithTimeout("Export requested successfully!");
          await fetchExports(); // Refresh the list
        } else {
          throw new Error(result.error || "Failed to request export");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to request export";
        setErrorWithTimeout(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchExports, setErrorWithTimeout, setSuccessWithTimeout]
  );

  const downloadExport = useCallback(
    async (exportId: number) => {
      try {
        const blob = await analyticsService.downloadExport(exportId);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `export-${exportId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        setErrorWithTimeout("Failed to download export");
        console.error("Error downloading export:", err);
        throw err;
      }
    },
    [setErrorWithTimeout]
  );

  return {
    // State
    reports,
    exports,
    dashboardData,
    loading,
    error,
    success,

    // Actions
    fetchReports,
    generateReport,
    fetchExports,
    requestExport,
    downloadExport,
    fetchDashboardData,

    // Utilities
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
};
