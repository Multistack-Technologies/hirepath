// components/layout/DashboardContent.tsx
import { ReactNode } from 'react';
import { useLayout } from '@/context/LayoutContext';

interface DashboardContentProps {
  children: ReactNode;
}

export default function DashboardContent({ children }: DashboardContentProps) {
  const { profileError, companyError, isProfileLoading, isCompanyLoading } = useLayout();

  return (
    <div className="flex-1 overflow-auto"> {/* This enables scrolling */}
      <div className="p-4 sm:p-6 lg:p-8 min-h-full"> {/* Container with padding */}
        {/* Global Error Display */}
        {(profileError || companyError) && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Attention Required</h3>
                <p className="text-sm text-red-700 mt-1">
                  {profileError || companyError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading States */}
        {(isProfileLoading || isCompanyLoading) && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-sm text-blue-700">Loading your data...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}