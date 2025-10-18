// app/dashboard/page.tsx
"use client";
import { useDashboard } from "@/hooks/useDashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardError from "@/components/dashboard/DashboardError";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useDashboard();

  // Show loading state
  if (isLoading) {
    return <DashboardLoading />;
  }

  if (!isAuthenticated || !user) {
    console.log("🔐 Dashboard Page - Not authenticated, showing error");
    return (
      <DashboardError
        message="You need to be logged in to access the dashboard."
        showRedirect={true}
        redirectUrl="/login"
        redirectText="Sign In"
      />
    );
  }

  return (
    <DashboardLayout pageTitle="Dashboard">
      <DashboardContent />
    </DashboardLayout>
  );
}
