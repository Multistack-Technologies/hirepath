import api from '@/lib/api';
import { Job, JobFormData, JobCreatePayload, Skill, Certificate, Degree } from '@/types';

export const jobsService = {
  // Job operations
  getMyJobs: () => api.get<Job[]>('/jobs/me/'),
  
  getJobDetails: (jobId: number) => api.get<Job>(`/jobs/${jobId}/`),
  
  createJob: (jobData: JobCreatePayload) => api.post<Job>('/jobs/', jobData),
  
  updateJob: (jobId: number, jobData: Partial<JobCreatePayload>) => 
    api.put<Job>(`/jobs/${jobId}/`, jobData),
  
  deleteJob: (jobId: number) => api.delete(`/jobs/${jobId}/`),

  // Public job listings
  getActiveJobs: () => api.get<Job[]>('/jobs/active/'),
  
  getJobCategories: () => api.get<any>('/jobs/categories/'),

  // Skills operations
  getAllSkills: () => api.get<Skill[]>('/skills/'),
  
  // Certificates operations
  getAllCertificates: () => api.get<Certificate[]>('/certificates/'),
  
  // Degrees operations
  getAllDegrees: () => api.get<Degree[]>('/degrees/'),
  
  // Applications operations
  getJobApplications: (jobId: number) => 
    api.get<{ results: any[] }>(`/applications/job/${jobId}/`),
};

// Helper function to transform form data to API payload
export const transformJobFormData = (formData: JobFormData, companyId: number): JobCreatePayload => {
  return {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    employment_type: formData.employment_type || 'FULL_TIME',
    work_type: formData.work_type || 'ONSITE',
    experience_level: formData.experience_level || 'MID',
    min_salary: formData.min_salary,
    max_salary: formData.max_salary,
    closing_date: formData.closing_date,
    skills_required_ids: formData.skills_required_ids,
    certificates_preferred_ids: formData.certificates_preferred_ids || [],
    courses_preferred_ids: formData.courses_preferred_ids || [],
  };
};