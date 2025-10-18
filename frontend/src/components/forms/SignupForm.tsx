// components/forms/SignupForm.tsx
'use client';
import { useState } from 'react';
import { useSignup } from '@/hooks/useSignup';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import PasswordInput from '@/components/forms/PasswordInput';
import RoleSelector from '@/components/forms/RoleSelector';
import Link from 'next/link';

interface SignupFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function SignupForm({ 
  onSuccess, 
  onError, 
  className = '' 
}: SignupFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'GRADUATE' as 'GRADUATE' | 'RECRUITER',
  });

  const { isLoading, error, handleSignup } = useSignup({ onSuccess, onError });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.first_name.trim() || !formData.last_name.trim() || 
        !formData.email.trim() || !formData.password.trim()) {
      return;
    }

    await handleSignup(formData);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`w-full bg max-w-md space-y-6 p-6 sm:p-8 bg-white shadow-lg rounded-lg border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-[#7551FF]">
          HIRE<span className="text-[#130160]">-PATH</span>
        </h1>
        <h2 className="text-xl font-medium text-gray-500 mt-2">Create Your Account</h2>
        <p className="text-sm text-gray-400 mt-1">Join thousands of professionals</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            id="first_name"
            label="First Name"
            type="text"
            value={formData.first_name}
            onChange={(e) => updateField('first_name', e.target.value)}
            required
            placeholder="John"
            className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <TextField
            id="last_name"
            label="Last Name"
            type="text"
            value={formData.last_name}
            onChange={(e) => updateField('last_name', e.target.value)}
            required
            placeholder="Doe"
            className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <TextField
          id="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          required
          placeholder="you@example.com"
          className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          disabled={isLoading}
        />

        {/* Password */}
        <PasswordInput
          id="password"
          label="Password"
          value={formData.password}
          onChange={(value) => updateField('password', value)}
          required
          placeholder="Create a strong password"
          disabled={isLoading}
        />

        {/* Role Selector */}
        <RoleSelector
          value={formData.role}
          onChange={(value) => updateField('role', value)}
          disabled={isLoading}
        />

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
            disabled={isLoading}
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Privacy Policy
            </Link>
          </label>
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
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      {/* Login Link */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-[#7551FF] hover:text-[#6344d6] font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}