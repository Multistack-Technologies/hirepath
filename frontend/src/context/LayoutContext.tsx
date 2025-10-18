// context/LayoutContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

// Enhanced types to match your Django API
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'GRADUATE' | 'RECRUITER';
  phone_number: string | null;
  phone: string | null;
  avatarUrl: string | null;
  linkedin_url: string | null;
  location: any;
  bio: string | null;
  job_title: string | null;
  skills: any[];
  target_job_roles: any[];
  current_job_role: any;
  educations: any[];
  certificates: any[];
  work_experiences: any[];
  date_joined: string;
  last_login: string;
}

export interface CompanyProfile {
  id: number;
  name: string;
  description: string;
  website: string;
  logo: string | null;
  location: any;
  industry: string;
  size: string;
  founded_year: number;
  user: number;
}

interface LayoutContextType {
  // Company State
  company: CompanyProfile | null;
  isCompanyLoading: boolean;
  companyError: string | null;
  refetchCompany: () => Promise<void>;
  updateCompany: (data: Partial<CompanyProfile>) => Promise<void>;

  // User Profile State
  profile: UserProfile | null;
  isProfileLoading: boolean;
  profileError: string | null;
  refetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Skills Management
  updateSkills: (skillIds: number[]) => Promise<void>;
  addSkill: (skillId: number) => Promise<void>;
  removeSkill: (skillId: number) => Promise<void>;
  
  // Job Roles Management
  updateTargetJobRoles: (jobRoleIds: number[]) => Promise<void>;
  setCurrentJobRole: (jobRoleId: number) => Promise<void>;
  removeCurrentJobRole: () => Promise<void>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();

  // Company State
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isCompanyLoading, setIsCompanyLoading] = useState<boolean>(true);
  const [companyError, setCompanyError] = useState<string | null>(null);

  // User Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch User Profile
  const fetchProfile = async () => {
    if (!user || !token) {
      setIsProfileLoading(false);
      setProfile(null);
      setProfileError(null);
      return;
    }

    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const response = await api.get<UserProfile>('/accounts/profile/');
      setProfile(response.data);
    } catch (err: any) {
      console.error("LayoutContext - Error fetching profile:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load user profile.';
      setProfileError(errorMessage);
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Update User Profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await api.put('/accounts/profile/update/', data);
      setProfile(response.data);
      return response.data;
    } catch (err: any) {
      console.error("LayoutContext - Error updating profile:", err);
      throw err;
    }
  };

  // Skills Management
  const updateSkills = async (skillIds: number[]) => {
    try {
      await api.post('/accounts/skills/set/', { skill_ids: skillIds });
      await refetchProfile(); // Refresh profile to get updated skills
    } catch (err: any) {
      console.error("LayoutContext - Error updating skills:", err);
      throw err;
    }
  };

  const addSkill = async (skillId: number) => {
    try {
      await api.post('/accounts/skills/add/', { skill_id: skillId });
      await refetchProfile();
    } catch (err: any) {
      console.error("LayoutContext - Error adding skill:", err);
      throw err;
    }
  };

  const removeSkill = async (skillId: number) => {
    try {
      await api.delete(`/accounts/skills/remove/${skillId}/`);
      await refetchProfile();
    } catch (err: any) {
      console.error("LayoutContext - Error removing skill:", err);
      throw err;
    }
  };

  // Job Roles Management
  const updateTargetJobRoles = async (jobRoleIds: number[]) => {
    try {
      await api.post('/accounts/job-roles/target/', { job_role_ids: jobRoleIds });
      await refetchProfile();
    } catch (err: any) {
      console.error("LayoutContext - Error updating target job roles:", err);
      throw err;
    }
  };

  const setCurrentJobRole = async (jobRoleId: number) => {
    try {
      await api.post('/accounts/job-roles/current/', { job_role_id: jobRoleId });
      await refetchProfile();
    } catch (err: any) {
      console.error("LayoutContext - Error setting current job role:", err);
      throw err;
    }
  };

  const removeCurrentJobRole = async () => {
    try {
      await api.delete('/accounts/job-roles/current/remove/');
      await refetchProfile();
    } catch (err: any) {
      console.error("LayoutContext - Error removing current job role:", err);
      throw err;
    }
  };

  // Fetch Company Data
  const fetchCompany = async () => {
    if (user?.role !== 'RECRUITER') {
      setIsCompanyLoading(false);
      setCompany(null);
      return;
    }

    setIsCompanyLoading(true);
    setCompanyError(null);
    try {
      const response = await api.get<CompanyProfile>('/companies/me/');
      setCompany(response.data);
    } catch (err: any) {
      console.error("LayoutContext - Error fetching company:", err);
      if (err.response?.status === 404) {
        setCompanyError("Company profile not found.");
      } else {
        setCompanyError(err.response?.data?.error || err.message || 'Failed to load company data.');
      }
      setCompany(null);
    } finally {
      setIsCompanyLoading(false);
    }
  };

  const updateCompany = async (data: Partial<CompanyProfile>) => {
    try {
      const response = await api.put('/companies/me/', data);
      setCompany(response.data);
      return response.data;
    } catch (err: any) {
      console.error("LayoutContext - Error updating company:", err);
      throw err;
    }
  };

  // Refetch functions
  const refetchProfile = async () => {
    await fetchProfile();
  };

  const refetchCompany = async () => {
    await fetchCompany();
  };

  // Effects
  useEffect(() => {
    fetchProfile();
  }, [user, token]);

  useEffect(() => {
    fetchCompany();
  }, [user?.role]);

  const value: LayoutContextType = {
    // Company
    company,
    isCompanyLoading,
    companyError,
    refetchCompany,
    updateCompany,
    
    // Profile
    profile,
    isProfileLoading,
    profileError,
    refetchProfile,
    updateProfile,
    
    // Skills
    updateSkills,
    addSkill,
    removeSkill,
    
    // Job Roles
    updateTargetJobRoles,
    setCurrentJobRole,
    removeCurrentJobRole,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};