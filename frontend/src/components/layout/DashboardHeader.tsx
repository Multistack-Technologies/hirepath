// components/layout/DashboardHeader.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';

interface DashboardHeaderProps {
  pageTitle: string;
  pageDescription?: string;
  headerAction?: React.ReactNode;
  onMenuToggle: () => void;
}

export default function DashboardHeader({ 
  pageTitle, 
  pageDescription, 
  headerAction,
  onMenuToggle 
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const { profile, isProfileLoading } = useLayout();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsUserMenuOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setIsUserMenuOpen(false);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    setIsUserMenuOpen(false);
  };

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.first_name && user?.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user?.email || 'User';
  };

  const getUserRoleDisplay = () => {
    return user?.role ? `${user.role.charAt(0) + user.role.slice(1).toLowerCase()}` : 'User';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Page title and mobile menu */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="ml-4 lg:ml-0">
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              {pageDescription && (
                <p className="text-sm text-gray-600 mt-1">{pageDescription}</p>
              )}
            </div>
          </div>

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-4">
            {/* Header Action */}
            {headerAction}

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      height={32}
                      width={32}
                      src={profile?.avatarUrl || "/default_profile.svg"}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/default_profile.svg";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {isProfileLoading ? (
                        <span className="animate-pulse bg-gray-200 rounded">Loading...</span>
                      ) : (
                        getUserDisplayName()
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getUserRoleDisplay()}
                    </p>
                  </div>
                  
                  <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserIcon className="h-4 w-4 mr-3" />
                    My Profile
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3" />
                    Settings
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}