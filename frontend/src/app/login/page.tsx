// app/login/page.tsx
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import HeroSection from '@/components/auth/HeroSection';
import LoginForm from '@/components/forms/LoginForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LoginPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Add debugging
  useEffect(() => {
    console.log('🔐 Login Page - User state:', user);
    console.log('🔐 Login Page - Auth loading:', authLoading);
  }, [user, authLoading]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      console.log('🔐 Login Page - Redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Don't render if already authenticated (will redirect)
  if (user) {
    console.log('🔐 Login Page - User exists, not rendering form');
    return null;
  }

  const handleLoginSuccess = () => {
    console.log('🔐 Login successful callback');
  };

  const handleLoginError = (error: string) => {
    console.error('🔐 Login error callback:', error);
  };

  return (
    <AuthLayout
      heroSection={
        <HeroSection
          title="Welcome Back!"
          subtitle="Connect with opportunities that match your skills and aspirations"
        />
      }
    >
      <LoginForm
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </AuthLayout>
  );
}