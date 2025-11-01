// services/analyticsService.ts
import api, { apiHelper } from '@/lib/api';
import { Report, Export, GenerateReportData, ExportRequestData, ApiResponse, DashboardData } from '@/types';

class AnalyticsService {
  // Reports API
  async getReports(): Promise<Report[]> {
    const response = await api.get('/analytics/reports/');
    return response.data;
  }

  async generateReport(data: GenerateReportData): Promise<ApiResponse<{ report_id: number }>> {
    const response = await api.post('/analytics/reports/generate/', data);
    return response.data;
  }

  async getReportDetails(reportId: number): Promise<Report> {
    const response = await api.get(`/analytics/reports/${reportId}/`);
    return response.data;
  }

  async exportReport(reportId: number, format: string): Promise<ApiResponse<{ file_url?: string }>> {
    const response = await api.post(`/analytics/reports/${reportId}/export/`, { format });
    return response.data;
  }

  // Exports API
  async getExports(): Promise<Export[]> {
    const response = await api.get('/analytics/exports/');
    return response.data;
  }

  async requestExport(data: ExportRequestData): Promise<ApiResponse<{ export_id: number }>> {
    const response = await api.post('/analytics/exports/request/', data);
    return response.data;
  }

  async downloadExport(exportId: number): Promise<{ blob: Blob; filename: string }> {
    const response = await api.get(`/analytics/exports/${exportId}/download/`, {
      responseType: 'blob',
    });
    
    // Extract filename from content-disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = `export-${exportId}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    return {
      blob: response.data,
      filename: filename
    };
  }

  // Dashboard Analytics
  async getDashboardOverview(days: number = 30): Promise<DashboardData> {
    const response = await api.get(`/analytics/dashboard/?days=${days}`);
    return response.data.data;
  }

  async getAnalyticsData(reportType: string, params: { start_date?: string; end_date?: string } = {}): Promise<any> {
    const queryParams = new URLSearchParams(params as any);
    const response = await api.get(`/analytics/analytics/${reportType}/?${queryParams}`);
    return response.data;
  }

  // Helper method to get user-friendly error messages
  getErrorMessage(error: any): string {
    return apiHelper.getErrorMessage(error);
  }
}

export const analyticsService = new AnalyticsService();