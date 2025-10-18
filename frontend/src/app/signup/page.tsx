// app/signup/page.tsx
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import HeroSection from '@/components/auth/HeroSection';
import SignupForm from '@/components/forms/SignupForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SignupPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Don't render if already authenticated (will redirect)
  if (user) {
    return null;
  }

  const handleSignupSuccess = () => {
    console.log('Signup successful!');
    // You can add analytics or other side effects here
  };

  const handleSignupError = (error: string) => {
    console.error('Signup failed:', error);
    // You can add error tracking here
  };

  return (
    <AuthLayout
      heroSection={
        <HeroSection
          title="Start Your Journey"
          subtitle="Join our community of professionals and discover amazing opportunities"
        />
      }
    >
      <SignupForm
        onSuccess={handleSignupSuccess}
        onError={handleSignupError}
      />
    </AuthLayout>
  );
}