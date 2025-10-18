// components/forms/LoginForm.tsx
'use client';
import { useState } from 'react';
import { useLogin } from '@/hooks/useLogin';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import PasswordInput from '@/components/forms/PasswordInput';
import Link from 'next/link';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function LoginForm({ 
  onSuccess, 
  onError, 
  className = '' 
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { isLoading, error, handleLogin } = useLogin({ onSuccess, onError });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    await handleLogin(email, password, rememberMe);
  };

  return (
    <div className={`w-full max-w-md space-y-6 p-6 sm:p-8 bg-white shadow-lg rounded-lg border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-[#7551FF]">
          HIRE<span className="text-[#130160]">-PATH</span>
        </h1>
        <h2 className="text-xl font-medium text-gray-500 mt-2">Welcome back</h2>
        <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          disabled={isLoading}
        />

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          required
          placeholder="Enter your password"
          disabled={isLoading}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <Link 
            href="/forgot-password" 
            className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full mt-2 bg-[#7551FF] hover:bg-[#6344d6] focus:ring-[#7551FF]"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            href="/signup" 
            className="text-[#7551FF] hover:text-[#6344d6] font-semibold transition-colors"
          >
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}