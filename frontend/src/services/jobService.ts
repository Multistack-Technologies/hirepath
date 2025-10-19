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

  // Get current user's jobs
  async getMyJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs/me/');
    return response.data;
  }

  // Create a new job
  async createJob(jobData: JobCreateData): Promise<Job> {
       // Ensure all array fields are properly formatted
       console.log(jobData)
    const formattedData = {
      ...jobData,
      skills_required_ids: jobData.skills_required_ids || [],
      certificates_preferred_ids: jobData.certificates_preferred_ids || [],
      courses_preferred_ids: jobData.courses_preferred_ids || [],
    };
    const response = await api.post<Job>('/jobs/', formattedData);
    return response.data;
  }

  // Get job by ID


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

  async applyToJob(jobId: number, coverLetter: string): Promise<void> {
    await api.post('/applications/apply/', {
      job: jobId,
      cover_letter: coverLetter,
    });
  }

   async getJobById(id: number): Promise<Job> {
    const response = await api.get<Job>(`/jobs/${id}/`);
    const job = response.data;
    
    // Ensure arrays are always defined
    return {
      ...job,
      skills_required: job.skills_required || [],
      certificates_preferred: job.certificates_preferred || [],
      courses_preferred: job.courses_preferred || [],
    };
  }

  async getActiveJobs(): Promise<Job[]> {
    const response = await api.get<Job[]>('/jobs/active/');
    return (response.data || []).map(job => ({
      ...job,
      skills_required: job.skills_required || [],
      certificates_preferred: job.certificates_preferred || [],
      courses_preferred: job.courses_preferred || [],
    }));
  }



}

export const jobService = new JobService();