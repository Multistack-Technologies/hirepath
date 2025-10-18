// hooks/useLogin.ts
'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useLogin({ onSuccess, onError }: UseLoginProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      
      // Handle remember me if needed (your AuthContext already uses localStorage)
      if (!rememberMe) {
        // Optionally use sessionStorage for non-remembered sessions
      }

      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
      
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
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
    handleLogin,
  };
}

// Helper function to extract error messages from Django responses
function getErrorMessage(error: any): string {
  if (error.response?.data) {
    const data = error.response.data;
    
    if (data.detail) return data.detail;
    if (data.non_field_errors) return data.non_field_errors[0];
    if (typeof data === 'string') return data;
    if (data.error) return data.error;
    
    // Handle field-specific errors
    if (typeof data === 'object') {
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError)) {
        return firstError[0];
      }
      return String(firstError);
    }
  }
  
  return error.message || 'Login failed. Please try again.';
}