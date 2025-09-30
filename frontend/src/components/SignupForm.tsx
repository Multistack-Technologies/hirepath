// src/components/SignupForm.tsx (Updated to use reusable components)
'use client';

import { useState } from 'react';
import   useAuth  from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from './Button'; 
import TextField from './TextField'; 

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'graduate' | 'recruiter'>('graduate');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state for button
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup(email, password, role, phone);
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Signup error:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Signup failed';
      setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
      {error && <p className="text-red-600 text-center">{error}</p>}
      <TextField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className="mb-4"> {/* Simple wrapper for select field */}
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'graduate' | 'recruiter')}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="graduate">Graduate</option>
          <option value="recruiter">Recruiter</option>
        </select>
      </div>
      <TextField
        id="phone"
        label="Phone (Optional)"
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? 'Signing Up...' : 'Sign Up'}
      </Button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/login" className="text-green-600 hover:underline">
          Login
        </a>
      </p>
    </form>
  );
}