// src/components/LoginForm.tsx (Updated to use reusable components)
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from './Button'; // Import the new Button component
import TextField from './TextField'; // Import the new TextField component

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state for button
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setIsLoading(true); // Set loading state
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
    } finally {
        setIsLoading(false); // Always stop loading after the attempt
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">Login</h2>
      {error && <p className="text-red-600 text-center">{error}</p>}
      <TextField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        // You can add helperText or error props here if needed
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading} // Pass loading state to button
        className="w-full" // Make button full width
      >
        {isLoading ? 'Logging In...' : 'Login'} {/* Button text changes based on loading state */}
      </Button>
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href="/signup" className="text-green-600 hover:underline">
          Sign Up
        </a>
      </p>
    </form>
  );
}