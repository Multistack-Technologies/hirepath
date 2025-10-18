// hooks/useSignup.ts
'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface SignupData {
  email: string;
  password: string;
  role: 'GRADUATE' | 'RECRUITER';
  first_name: string;
  last_name: string;
  phone_number?: string;
  linkedin_url?: string;
  bio?: string;
  job_title?: string;
  skills?: number[];
}

interface UseSignupProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useSignup({ onSuccess, onError }: UseSignupProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignup = async (signupData: SignupData) => {
    setIsLoading(true);
    setError('');

    try {
      await signup(
       signupData
      );
      
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
      
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = getSignupErrorMessage(err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setError,
    handleSignup,
  };
}

// Helper function to extract error messages from Django responses
function getSignupErrorMessage(error: any): string {
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle Django validation errors
    if (typeof data === 'object') {
      // Check for common field errors
      const fieldErrors = [];
      
      if (data.username) fieldErrors.push(`Username: ${data.username[0]}`);
      if (data.email) fieldErrors.push(`Email: ${data.email[0]}`);
      if (data.password) fieldErrors.push(`Password: ${data.password[0]}`);
      if (data.role) fieldErrors.push(`Role: ${data.role[0]}`);
      if (data.first_name) fieldErrors.push(`First name: ${data.first_name[0]}`);
      if (data.last_name) fieldErrors.push(`Last name: ${data.last_name[0]}`);
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join(', ');
      }
      
      // Handle non-field errors
      if (data.non_field_errors) {
        return data.non_field_errors[0];
      }
      
      // Handle generic error
      if (data.error) {
        return data.error;
      }
    }
    
    if (typeof data === 'string') {
      return data;
    }
  }
  
  return error.message || 'Registration failed. Please try again.';
}