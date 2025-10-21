// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface SidebarItem {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: string | number | null;
}

interface SidebarProps {
  logoText?: string;
  items: SidebarItem[];
  activeHref?: string;
  className?: string;
  onCloseMobile?: () => void;
  showLogo?: boolean;
  isMobile?: boolean;
}

export default function Sidebar({ 
  logoText = "Hire-Path", 
  items, 
  activeHref, 
  className = '', 
  onCloseMobile,
  showLogo = true,
  isMobile = false
}: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activeHref || pathname;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return currentPath === href;
    }
    return currentPath?.startsWith(href);
  };

  const handleItemClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`
      bg-white shadow-lg border-r border-gray-200 
      flex flex-col z-50
      ${isMobile 
        ? 'fixed inset-0 w-full h-full' 
        : 'fixed lg:relative w-64 h-screen'
      }
      ${className}
    `}>
      {/* Logo Section */}
      {showLogo && (
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2"
              onClick={handleItemClick}
            >
              <h1 className="text-3xl !capitalize font-extrabold text-[#7551FF]">
                HIRE-<span className="text-[#130160]">PATH</span>
              </h1>
            </Link>
            
            {/* Close button for mobile */}
            {isMobile && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {items.map((item, index) => {
          const active = isActive(item.href);
          
          return (
            <Link
              key={index}
              href={item.href}
              onClick={handleItemClick}
              className={`
                flex items-center justify-between px-3 py-3 rounded-xl
                transition-all duration-200 group relative
                ${active
                  ? 'bg-gradient-to-r from-[#7551FF] to-[#9374FF] text-white shadow-lg shadow-indigo-100 transform scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  transition-transform duration-200
                  ${active 
                    ? 'text-white transform scale-110' 
                    : 'text-gray-400 group-hover:text-[#7551FF]'
                  }
                `}>
                  {item.icon}
                </div>
                <span className={`
                  font-medium transition-colors duration-200
                  ${active ? 'text-white' : 'group-hover:text-gray-900'}
                `}>
                  {item.label}
                </span>
              </div>

              {/* Badge */}
              {item.badge && (
                <span className={`
                  inline-flex items-center justify-center px-2 py-1 text-xs font-bold
                  rounded-full min-w-[20px] h-5 transition-colors duration-200
                  ${active
                    ? 'bg-white text-[#7551FF]'
                    : 'bg-[#7551FF] text-white'
                  }
                `}>
                  {item.badge}
                </span>
              )}

              {/* Active indicator dot */}
              {active && (
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-1 h-6 bg-white rounded-full"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Optional: User Quick Info Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7551FF] to-[#130160] rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">?</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Need Help?</p>
            <p className="text-xs text-gray-500 truncate">Visit our help center</p>
          </div>
        </div>
      </div>
    </aside>
  );
}