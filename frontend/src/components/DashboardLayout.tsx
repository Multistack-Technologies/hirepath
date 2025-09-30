// src/app/components/DashboardLayout.tsx
'use client'; // Mark as Client Component

import { useAuth } from '@/context/AuthContext'; // To get user info and logout
import { useRouter, usePathname } from 'next/navigation'; // For navigation on logout and getting current path
import Sidebar from '@/components/Sidebar'; // Your existing reusable Sidebar
import { ReactNode } from 'react'; // Import ReactNode for children type

// Define the props for the layout component
interface DashboardLayoutProps {
  children: ReactNode; // The content of the specific page
  pageTitle: string; // Title for the current page (e.g., "Dashboard", "My Profile")
}

export default function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const { user, logout } = useAuth(); // Get user info and logout function
  const router = useRouter(); // Get router for navigation
  const pathname = usePathname(); // Get the current path

  // Define sidebar items within the component
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
    logout(); // Call logout from context
    router.push('/'); // Redirect to home or login page after logout
  };

  if (!user) {
    // Optionally render a loading state or redirect message
    return <p>Loading...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        logoText="Hire-Path"
        items={sidebarItems}
        activeHref={pathname} // Pass the current path to the Sidebar
        className="z-10"
      />

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col"> {/* Flex column to stack TopBar and page content */}
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-semibold text-[#7551FF]">{pageTitle}</h1> {/* Use the passed title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 rounded-full p-2">
              <img
                src={user.avatarUrl || "https://via.placeholder.com/40"} // Use user's avatar or placeholder
                alt="User Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
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

        {/* Page Content (Passed as children) */}
        <div className="flex-1 p-8"> {/* Flex-1 allows content to take remaining space */}
          {children}
        </div>
      </main>
    </div>
  );
}