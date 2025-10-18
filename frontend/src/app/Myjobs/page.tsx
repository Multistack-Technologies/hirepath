'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FindWorkContent from '@/components/find-work/FindWorkContent';
import FindWorkLoading from '@/components/find-work/FindWorkLoading';


export default function FindWork() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <FindWorkLoading />;
  }

  return (
    <DashboardLayout pageTitle="Find Work">
      <FindWorkContent />
    </DashboardLayout>
  );
}