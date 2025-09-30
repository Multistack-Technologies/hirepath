// src/components/Sidebar.tsx
import Link from 'next/link';
import { ReactNode } from 'react';

interface SidebarItem {
  href: string;
  icon: ReactNode; // Accept JSX as icon
  label: string;
}

interface SidebarProps {
  logoText: string;
  items: SidebarItem[];
  activeHref?: string; // The current path
  className?: string; // Allow additional Tailwind classes
}

export default function Sidebar({ logoText, items, activeHref, className = '' }: SidebarProps) {
  return (
    <aside className={`bg-white shadow-md h-screen fixed w-64 ${className}`}>
      <div className="p-6 border-b">
        <h1 className="text-4xl font-extrabold text-[#7551FF]">Hire<span className="text-[#130160]" >-Path</span></h1>
      </div>
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {items.map((item, index) => {
            // Check if the current item's href matches the activeHref
            const isActive = activeHref === item.href;
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 font-semibold' // Active styles
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700' // Default/inactive styles
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}