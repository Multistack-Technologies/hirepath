'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileLoading from '@/components/profile/ProfileLoading';


export default function MyProfile() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <ProfileLoading />;
  }

  return (
    <DashboardLayout pageTitle="Profile">
      <ProfileContent />
    </DashboardLayout>
  );
}