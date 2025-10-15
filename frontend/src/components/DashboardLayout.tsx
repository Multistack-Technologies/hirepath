'use client';

import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import Sidebar from '@/components/Sidebar'; 
import { ReactNode, useEffect, useState } from 'react'; 
import  api  from '@/lib/api'; 
import { UserProfile, CompanyProfile } from '@/types'; 
import { useLayout } from '@/context/LayoutContext';
import { HomeIcon,BriefcaseIcon,UserIcon ,CircleStackIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';


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
      icon:  <HomeIcon className="h-5 w-5" />,
      label: 'Home',
    },
    {
      href: '/jobs',
      icon:<BriefcaseIcon className="h-5 w-5" />,
      label: 'My Jobs',
    },
    {
      href: '/profile',
      icon: <UserIcon className='h-5 w-5'/>
      ,
      label: 'My Profile',
    },
    {
      href: '/reports',
      icon: <CircleStackIcon className="h-5 w-5" />,
      label: 'Reports',
    },
  ];

   const graduateItems = [
    {
      href: '/dashboard',
      icon:  <HomeIcon className="h-5 w-5" />,
      label: 'Home',
    },
    {
      href: '/Myjobs',
      icon: <MagnifyingGlassIcon className="h-5 w-5" />,
      label: 'Find Job',
    },
    {
      href: '/applications',
      icon:<BriefcaseIcon className="h-5 w-5" />,
      label: 'My Jobs',
    },
    {
      href: '/profile',
      icon: <UserIcon className='h-5 w-5'/>
      ,
      label: 'My Profile',
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
        items={ user.role == "RECRUITER" ? sidebarItems : graduateItems}
        activeHref={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
        className="z-10"
      />


      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col h-screen">
        {/* Top Bar */}
        <header className="bg-white  shadow-sm p-4 flex justify-between items-center border-b">
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
        <div className="flex-1 p-8  overflow-auto scroll-auto ">
          {/* Optionally display global errors if context fetch failed */}
          {(profileError || companyError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{profileError || companyError}</p>
            </div>
          )}
          {children}
        </div>
        <footer className=' border-t border-gray-200 p-3'>
          <p className='text-center text-blue-950 text-sm'>Hire-Path @2025 CopyRight Reserved</p>
        </footer>
      </main>
    </div>
  );
}