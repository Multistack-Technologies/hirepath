// components/layout/DashboardLayout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import SidebarNavigation from "./SidebarNavigation";
import DashboardHeader from "./DashboardHeader";
import DashboardContent from "./DashboardContent";
import DashboardFooter from "./DashboardFooter";
import DashboardLoading from "../dashboard/DashboardLoading";

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
  pageDescription?: string;
  headerAction?: ReactNode;
}

export default function DashboardLayout({
  children,
  pageTitle,
  pageDescription,
  headerAction,
}: DashboardLayoutProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Close mobile menu on resize and route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Show loading state
  if (authLoading) {
    return <DashboardLoading />;
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return <DashboardLoading />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar Navigation */}
      <SidebarNavigation
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Header */}
        <div className="flex-shrink-0">
          <DashboardHeader
            pageTitle={pageTitle}
            pageDescription={pageDescription}
            headerAction={headerAction}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <DashboardContent>{children}</DashboardContent>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0">
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}