// src/app/signup/page.tsx
'use client'; // Mark this as a Client Component

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import TextField from '@/components/TextField';

export default function SignupPage() {
  const [fullname, setFullname] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'GRADUATE' | 'RECRUITER'>('GRADUATE'); // State for role selection
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signup(email, password, role, fullname,surname);
    
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Signup failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Decorative Background */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden rounded-tr-4xl rounded-br-4xl">
        {/* Add subtle wave or abstract shapes if desired */}
        <div className="absolute inset-0 opacity-30">
          {/* You can add SVG paths or divs here for more complex backgrounds */}
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6 p-8 bg-white shadow-lg rounded-lg">
          
          <div>
              <h1 className="text-3xl font-black text-center  text-[#7551FF]">HIRE<span className="text-[#130160]" >-PATH</span></h1>
              <h1 className="text-xl font-medium text-gray-400 text-center">Create Account</h1>
          </div>

          {error && <p className="text-red-600 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                id="fullname"
                label="Fullname"
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                placeholder="John"
                className="border-gray-200 focus:border-indigo-500"
              />
              <TextField
                id="surname"
                label="Surname"
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                placeholder="Doe"
                className="border-gray-200 focus:border-indigo-500"
              />
            </div>

            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="border-gray-200 focus:border-indigo-500"
            />

            <div className="relative">
              <TextField
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className=" border-gray-200 focus:border-indigo-500 pr-10"
              />
              {/* Eye Icon Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4h.01a2 2 0 000 4H10z" />
                    <path fillRule="evenodd" d="M.416 10C0 10 .017 10 0 10v.017C0 10.017.017 10.017.017 10.017V10C.017 10 .017 10 .017 10zm10 0a8 8 0 110-16 8 8 0 010 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.28 10.28a7 7 0 0113.44 0 7 7 0 01-13.44 0zM10 12a2 2 0 100-4h.01a2 2 0 000 4H10z" clipRule="evenodd" />
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a7 7 0 007-7H3a7 7 0 007 7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center">
              <input
                id="RECRUITER"
                name="RECRUITER"
                type="checkbox"
                checked={role === 'RECRUITER'} // Bind checkbox state to role
                onChange={(e) => setRole(e.target.checked ? 'RECRUITER' : 'GRADUATE')} // Update role on change
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="RECRUITER" className="ml-2 block text-sm text-gray-900">
                Recruiter
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? 'Signing Up...' : 'REGISTER'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}