// hooks/useDashboard.ts
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UseDashboardReturn {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  redirectToLogin: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // If user data is available, loading is complete
    if (user) {
      setIsLoading(false);
    }
  }, [user, authLoading, router]);

  const redirectToLogin = () => {
    router.push('/login');
  };

  return {
    user,
    isLoading: isLoading || authLoading,
    isAuthenticated: !!user,
    redirectToLogin,
  };
}