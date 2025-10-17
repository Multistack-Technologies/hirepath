// Skill Interface
interface Skill {
  id: number;
  name: string;
}

// Education Interface
interface Education {
  id?: number;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string | null;
  description?: string | null;
}

// Certificate Interface
interface Certificate {
  id?: number;
  name?: string;
  issuing_organization?: string;
  issue_date?: string;
  expiration_date?: string | null;
}

// Work Experience Interface
interface WorkExperience {
  id?: number;
  company?: string;
  position?: string;
  start_date?: string;
  end_date?: string | null;
  current?: boolean;
  description?: string | null;
}

// Target Job Role Interface
interface TargetJobRole {
  id?: number;
  title?: string;
  level?: string | null;
}

// Main User Interface
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  skills: Skill[];
  target_job_roles: TargetJobRole[];
  current_job_role: string | null;
  educations: Education[];
  certificates: Certificate[];
  work_experiences: WorkExperience[];
  linkedin_url: string | null;
  phone_number: string | null;
  phone: string | null;
  location: string | null;
  avatarUrl: string | null;
  bio: string | null;
  job_title: string | null;
  date_joined: string;
  last_login: string | null;
}


enum UserRole {
  GRADUATE = 'GRADUATE',
  RECRUITER = 'RECRUITER',

}

enum JobLevel {
  ENTRY = 'ENTRY',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  MANAGER = 'MANAGER'
}