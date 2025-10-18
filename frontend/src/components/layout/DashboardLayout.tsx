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

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      {/* Sidebar Navigation - Fixed */}
      <div className="w-[18%]">
        <SidebarNavigation
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area - Grid layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed height, no scroll */}
        <div className="flex-shrink-0">
          <DashboardHeader
            pageTitle={pageTitle}
            pageDescription={pageDescription}
            headerAction={headerAction}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>

        {/* Content Area - Scrollable with flex-1 */}
        <div className="flex-1 flex flex-col min-h-0">
          <DashboardContent>{children}</DashboardContent>
        </div>

        {/* Footer - Fixed height, no scroll */}
        <div className="flex-shrink-0">
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
