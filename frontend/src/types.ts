export interface UserProfile {
  linkedin_url: string | null | undefined;
  phone_number: string | null | undefined;
  location: any;
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

export interface Candidate {
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

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  employment_type: string;
  description: string;
  requirementIds: number[]; 
  skills_required : Skill[];
  posted_date: string;
  application_deadline: string;
  remote_ok: boolean;
  // Add other fields as needed
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
  id: number;
  name: string;
  // ... other degree fields
}