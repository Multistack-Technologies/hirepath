// components/layout/SidebarNavigation.tsx
'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';

interface SidebarNavigationProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function SidebarNavigation({ isMobileOpen, onCloseMobile }: SidebarNavigationProps) {
  const { user } = useAuth();
  const { profile } = useLayout();
  const pathname = usePathname();

  const recruiterItems = [
    {
      href: '/dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      label: 'Dashboard',
      badge: null,
    },
    {
      href: '/jobs',
      icon: <BriefcaseIcon className="h-5 w-5" />,
      label: 'Job Posts',
      badge: null,
    },
    {
      href: '/recruiter/candidates',
      icon: <UserIcon className="h-5 w-5" />,
      label: 'Candidates',
      badge: null,
    },
    {
      href: '/analytics',
      icon: <ChartBarIcon className="h-5 w-5" />,
      label: 'Analytics',
      badge: null,
    },
  ];

  const graduateItems = [
    {
      href: '/dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      label: 'Dashboard',
      badge: null,
    },
    {
      href: '/jobs',
      icon: <MagnifyingGlassIcon className="h-5 w-5" />,
      label: 'Find Jobs',
      badge: null,
    },
    {
      href: '/applications',
      icon: <BriefcaseIcon className="h-5 w-5" />,
      label: 'My Applications',
      badge: null,
    },
    {
      href: '/profile',
      icon: <UserIcon className="h-5 w-5" />,
      label: 'My Profile',
      badge: profile?.skills?.length ? `${profile.skills.length} skills` : null,
    }
  ];

  const getSidebarItems = () => {
    if (!user?.role) return graduateItems;
    return user.role === "RECRUITER" ? recruiterItems : graduateItems;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        
        transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition duration-300 ease-in-out
      `}>
        <Sidebar
          logoText="Hire-Path"
          items={getSidebarItems()}
          activeHref={pathname}
          onCloseMobile={onCloseMobile}
        />
      </div>
    </>
  );
}