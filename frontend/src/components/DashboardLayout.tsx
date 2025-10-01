'use client';

import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import Sidebar from '@/components/Sidebar'; 
import { ReactNode, useEffect, useState } from 'react'; 
import  api  from '@/lib/api'; 
import { UserProfile, CompanyProfile } from '@/types'; 
import { useLayout } from '@/context/LayoutContext';


interface DashboardLayoutProps {
  children: ReactNode; 
  pageTitle: string; 
}

export default function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const { user, logout } = useAuth(); 
  const { profile, isProfileLoading, profileError, company, isCompanyLoading, companyError } = useLayout();
  const router = useRouter(); 


  const sidebarItems = [
    {
      href: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 001 1h3m-6 0a1 1 0 001-1v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 001-1v-4z" />
        </svg>
      ),
      label: 'Home',
    },
    {
      href: '/jobs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 002-2H9M9 5H7M7 5a2 2 0 002 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2z" />
        </svg>
      ),
      label: 'My Jobs',
    },
    {
      href: '/profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a4 4 0 214 4 0 014 4v2a4 4 0 214 4 0 01-4 4h-4a4 4 0 214 4 0 01-4-4v-2a4 4 0 214 4 0 014-4h4z" />
        </svg>
      ),
      label: 'My Profile',
    },
    {
      href: '/reports',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 002-2H9M9 5H7M7 5a2 2 0 002 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2z" />
        </svg>
      ),
      label: 'Reports',
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <p>Loading...</p>; 
  }

  return (
          <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        logoText="Hire-Path"
        items={sidebarItems}
        activeHref={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
        className="z-10"
      />

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
          <div className="flex items-center space-x-4">
            {/* User Profile Info */}
            <div className="flex items-center bg-gray-100 rounded-full p-2">
              {/* Display User Avatar or Placeholder */}
              <img
                src={profile?.avatarUrl || "https://via.placeholder.com/40"}
                alt="User Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <div>
                {/* Display User Name or Email */}
                {isProfileLoading ? (
                  <p className="text-sm font-medium text-gray-900">Loading...</p>
                ) : profileError ? (
                  <p className="text-sm font-medium text-red-600">Error loading profile</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {profile ? `${profile.first_name} ${profile.last_name}` : user.email}
                    </p>
                    {/* Display Role and potentially Company Name */}
                    <p className="text-xs text-gray-500">
                      {user.role === 'RECRUITER' && company ?
                        `${user.role} at ${company.name}` :
                        user.role}
                    </p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8">
          {/* Optionally display global errors if context fetch failed */}
          {(profileError || companyError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{profileError || companyError}</p>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}