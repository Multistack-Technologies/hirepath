'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import RecruiterDashboard from '@/components/dashboard/RecruiterDashboard';
import GraduateDashboard from '@/components/dashboard/GraduateDashboard';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import DashboardError from '@/components/dashboard/DashboardError';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <DashboardLoading />;
  }

  return (
    <DashboardLayout pageTitle="Dashboard">
      {user.role === 'RECRUITER' ? (
        <RecruiterDashboard />
      ) : user.role === 'GRADUATE' ? (
        <GraduateDashboard />
      ) : (
        <DashboardError message="Access Denied. Invalid user role." />
      )}
    </DashboardLayout>
  );
}