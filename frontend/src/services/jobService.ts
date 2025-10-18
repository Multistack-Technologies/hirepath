// services/jobService.ts
import api, { apiHelper } from '@/lib/api';
import { Job, JobCreateData, JobFilters, JobStats, JobCategories } from '@/types';

class JobService {
  // Get all jobs with optional filters
  async getJobs(filters?: JobFilters): Promise<Job[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value);
          }
        }
      });
    }

    const response = await api.get<Job[]>(`/jobs/?${params}`);
    return response.data;
  }

  // Get active jobs only
  async getActiveJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs/active/');
    return response.data;
  }

  // Get current user's jobs
  async getMyJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs/me/');
    return response.data;
  }

  // Create a new job
  async createJob(jobData: JobCreateData): Promise<Job> {
    const response = await api.post<Job>('/jobs/', jobData);
    return response.data;
  }

  // Get job by ID
  async getJobById(id: number): Promise<Job> {
    const response = await api.get<Job>(`/jobs/${id}/`);
    return response.data;
  }

  // Update job
  async updateJob(id: number, jobData: Partial<JobCreateData>): Promise<Job> {
    const response = await api.put<Job>(`/jobs/${id}/`, jobData);
    return response.data;
  }

  // Delete job
  async deleteJob(id: number): Promise<void> {
    await api.delete(`/jobs/${id}/`);
  }

  // Get job statistics
  async getJobStats(): Promise<JobStats> {
    const response = await api.get<JobStats>('/jobs/stats/');
    return response.data;
  }

  // Get job categories
  async getJobCategories(): Promise<JobCategories> {
    const response = await api.get<JobCategories>('/jobs/categories/');
    return response.data;
  }

  // Error handling
  getErrorMessage(error: any): string {
    return apiHelper.getErrorMessage(error);
  }
}

export const jobService = new JobService();