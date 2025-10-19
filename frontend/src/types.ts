export interface UserProfile {
  linkedin_url: string | null | undefined;
  phone_number: string | null | undefined;
  location: Location;
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatarUrl?: string; 
  bio?: string;
  job_title?: string;
  role: 'GRADUATE' | 'RECRUITER';
  skills: Skill[];
  date_joined?: string;
  last_login?: string;
}

export interface CompanyProfile {
  id: number;
  name: string;
  description?: string;
  website?: string;
  location?: string;
  logoUrl?: string;
}

export interface Skill {
  id: number;
  name: string;
}




export interface ResumeFeedback {
  score: number; 
  skills_detected: string[]; 
  missing_skills: string[];
  feedback: string[]; 
  job_role: string; 
}

export interface Application{
    id:number;
}

export interface Candidates {
  current_job_title: string;
  id: number;
  first_name: string;
  last_name: string;
  avatarUrl?: string;
  location: string;
  applied_date: string;
  match_score: number;
  match_details: {
    skills_matched: string[];
    skills_missing: string[];
    feedback: string[];
  };
}



export interface Skill {
  id: number;
  name: string;
}


export interface RecruiterStats {
  totalJobs: number;
  activeApplications: number;
  shortlisted: number;
  hired: number;
}

export interface GraduateStats {
  totalJobs: number;
  activeApplications: number;
  shortlisted: number;
  hired: number;
}


// types/index.ts
export interface ResumeAnalysis {
  score: number;
  total_score: number;
  file_name?: string;
  uploaded_at?: string;
  job_matches?: JobMatch[];
  skills_detected?: string[];
  missing_skills?: string[];
  course_recommendations?: CourseRecommendation[];
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface JobMatch {
  id: number;
  title: string;
  company: string;
  match_score: number;
  location?: string;
}

export interface CourseRecommendation {
  id: number;
  name: string;
  url: string;
  platform: string;
  duration?: string;
  level?: string;
}

export interface Education {
  id: number;
  user: number;
  university: University;
  degree: Degree;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  gpa: number | null;
  gpa_scale: number;
  description: string | null;
  duration: string;
  created_at: string;
  updated_at: string;
}

export interface University {
  id: number;
  name: string;
  // ... other university fields
}

export interface Degree {
  issuer_name: any;
  id: number;
  name: string;
  // ... other degree fields
}


export interface Certificate {
  id: number;
  user: number;
  provider: CertificateProvider;
  credential_id: string | null;
  certificate_url: string | null;
  issue_date: string;
  expiration_date: string | null;
  is_permanent: boolean;
  status: string;
  score: number | null;
  notes: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CertificateProvider {
  id: number;
  name: string;
  website: string | null;
  description: string | null;
}


export interface WorkExperience {
  id: number;
  user: number;
  company_name: string;
  job_title: string;
  is_current: boolean;
  description: string | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}


// types/job.ts
export interface Job {
  application_count:any
  skills: any;
  id: number;
  title: string;
  description: string;
  company: number;
  company_name: string;
  company_logo: string | null;
  location: string;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'TEMPORARY';
  employment_type_display: string;
  work_type: 'ONSITE' | 'REMOTE' | 'HYBRID';
  work_type_display: string;
  experience_level: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  experience_level_display: string;
  min_salary: number | null;
  max_salary: number | null;
  salary_range: string;
  closing_date: string | null;
  is_active: boolean;
  days_remaining: number | null;
  skills_required?: Skill[];
  certificates_preferred?: CertificateProvider[];
  courses_preferred?: Degree[];
  created_by: number;
  created_at: string;
  updated_at: string;
  skills_count?: number;
  department?: string;
  posted_date?: string;
  remote_ok?: boolean;
}

export interface JobCreateData {
  title: string;
  description: string;
  location: string;
  employment_type: string;
  work_type: string;
  experience_level: string;
  min_salary?: number;
  max_salary?: number;
  closing_date?: string;
  skills_required_ids?: number[];
  certificates_preferred_ids?: number[];
  courses_preferred_ids?: number[];
}

export interface JobFilters {
  search?: string;
  employment_type?: string[];
  work_type?: string[];
  experience_level?: string[];
  location?: string;
  skills?: number[];
  min_salary?: number;
  max_salary?: number;
}

export interface JobStats {
  total_jobs: number;
  active_jobs: number;
  employment_types: Record<string, { display_name: string; count: number }>;
  work_types: Record<string, { display_name: string; count: number }>;
}

export interface JobCategories {
  employment_types: Record<string, string>;
  work_types: Record<string, string>;
  experience_levels: Record<string, string>;
}

// Form options
export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
] as const;

export const WORK_TYPES = [
  { value: 'ONSITE', label: 'On-site' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'ENTRY', label: 'Entry Level (0-2 years)' },
  { value: 'MID', label: 'Mid Level (2-5 years)' },
  { value: 'SENIOR', label: 'Senior Level (5+ years)' },
  { value: 'LEAD', label: 'Lead/Manager' },
] as const;

export interface JobFormData {
  title: string;
  description: string;
  location: string;
  employment_type?: string;
  work_type?: string;
  experience_level?: string;
  min_salary?: number;
  max_salary?: number;
  closing_date?: string;
  skills_required_ids: number[];
  certificates_preferred_ids?: number[];
  courses_preferred_ids?: number[];
}

export interface JobCreatePayload {
  title: string;
  description: string;
  location: string;
  employment_type?: string;
  work_type?: string;
  experience_level?: string;
  min_salary?: number;
  max_salary?: number;
  closing_date?: string;
  skills_required_ids: number[];
  certificates_preferred_ids?: number[];
  courses_preferred_ids?: number[];
}

export interface SelectableItem {
  id: number;
  name: string;
  [key: string]: any; // For additional properties
}


// types/analytics.ts
export interface Report {
  id: number;
  title: string;
  report_type: string;
  description: string;
  date_range_start: string;
  date_range_end: string;
  filters_applied: any;
  report_data: any;
  generated_at: string;
  last_accessed: string;
  file_url?: string;
}

export interface Export {
  id: number;
  export_type: string;
  format: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  file_url?: string;
  created_at: string;
  completed_at?: string;
}

export interface GenerateReportData {
  report_type: string;
  title: string;
  date_range_start: string;
  date_range_end: string;
  filters?: any;
  description?: string;
}

export interface ExportRequestData {
  export_type: string;
  format: string;
  filters?: any;
  date_range_start?: string;
  date_range_end?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Constants
export const REPORT_TYPES = [
  { value: 'APPLICATION_ANALYSIS', label: 'Application Analysis' },
  { value: 'CANDIDATE_PIPELINE', label: 'Candidate Pipeline' },
  { value: 'TIME_TO_HIRE', label: 'Time to Hire' },
  { value: 'SOURCE_ANALYSIS', label: 'Source Analysis' },
  { value: 'SKILL_GAP_ANALYSIS', label: 'Skill Gap Analysis' },
] as const;

export const EXPORT_TYPES = [
  { value: 'APPLICATIONS', label: 'Applications' },
  { value: 'CANDIDATES', label: 'Candidates' },
  { value: 'JOBS', label: 'Jobs' },
  { value: 'ANALYTICS', label: 'Analytics' },
] as const;

export const EXPORT_FORMATS = [
  { value: 'EXCEL', label: 'Excel' },
  { value: 'CSV', label: 'CSV' },
  { value: 'PDF', label: 'PDF' },
] as const;

export interface DashboardData {
  period: string;
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  applications_trend: Array<{ date: string; count: number }>;
  conversion_rate: number;
  average_match_score: number;
  top_performing_jobs: Array<{ title: string; applications: number; match_score: number }>;
  quick_stats: {
    applications_today: number;
    pending_review: number;
    interviews_scheduled: number;
    new_hires: number;
  };
}

export interface AnalyticsDataResponse {
  success: boolean;
  data: DashboardData;
}

export interface MatchDetails {
  skills_matched: string[];
  skills_missing: string[];
  education_match: {
    has_required_education: boolean;
    preferred_courses: string[];
  };
  certificate_match: {
    matched_certificates: string[];
    missing_certificates: string[];
  };
  experience_match: {
    user_experience_years?: number;
    job_required_level?: string;
    match_percentage?: number;
  };
  feedback: string[];
}

export interface Candidate {
  application_id: number;
  applicant_id: number;
  first_name: string;
  last_name: string;
  email: string;
  location: string;
  current_job_title: string;
  applied_date: string;
  match_score: number;
  match_details: MatchDetails;
  job_title: string;
  company_name: string;
  application_status: string;
  cover_letter: string | null;
  notes: string | null;
  interview_date: string | null;
}

export interface CandidatesResponse {
  results: Candidate[];
  total_count: number;
  filters_applied: {
    status: string;
    min_match_score: string | number;
  };
}