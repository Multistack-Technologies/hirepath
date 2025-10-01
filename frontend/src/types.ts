export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'graduate' | 'recruiter';
  phone: string;
  avatarUrl?: string; 
  bio?: string;
  job_title?: string;
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

export interface Job {
  id: number;
  title: string;
  company: string; 
  company_id: number; 
  location: string;
  description: string;
  requirementIds: number[]; 
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

}

