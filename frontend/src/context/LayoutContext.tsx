'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import  api  from '@/lib/api';
import { CompanyProfile, UserProfile } from '@/types'; 

interface LayoutContextType {
  // --- Company State ---
  company: CompanyProfile | null;
  isCompanyLoading: boolean;
  companyError: string | null;
  refetchCompany: () => void;

  // --- User Profile State ---
  profile: UserProfile | null;
  isProfileLoading: boolean;
  profileError: string | null;
  refetchProfile: () => void; 
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // --- Company State ---
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isCompanyLoading, setIsCompanyLoading] = useState<boolean>(true);
  const [companyError, setCompanyError] = useState<string | null>(null);

  // --- User Profile State ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // --- Fetch Company Data ---
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


  const fetchProfile = async () => {
    if (!user) {
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
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load user profile data.';
      setProfileError(errorMessage);
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  };


  useEffect(() => {
    fetchProfile(); // Fetch profile whenever user changes (login/logout)
  }, [user]);

  useEffect(() => {
    fetchCompany(); // Fetch company whenever user or role changes
  }, [user?.role]);

  // --- Refetch Functions ---
  const refetchProfile = () => {
    fetchProfile();
  };

  const refetchCompany = () => {
    fetchCompany();
  };

  // --- Context Value ---
  const value: LayoutContextType = {
    // Company
    company,
    isCompanyLoading,
    companyError,
    refetchCompany,
    // Profile
    profile,
    isProfileLoading,
    profileError,
    refetchProfile,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}