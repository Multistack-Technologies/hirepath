// hirepath-frontend/src/context/AuthContext.tsx
'use client'; // This is crucial for Context Providers in Next.js App Router

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Correct import for default export from src/lib/api.ts (or src/utils/api.ts)
// Adjust the path if you kept it in utils
import api from '@/lib/api'; // Use default import

// Define the shape of your user data
interface User {
  id: number;
  email: string;
  role: 'graduate' | 'RECRUITER';
  phone: string;
  avatarUrl:string;
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  token: string | null; // Store the raw token if needed for other purposes
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: string, phone: string) => Promise<void>;
  logout: () => void;
}

// Create the context with an undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // We still store the token in state if needed, but the interceptor handles adding it to requests
  const [token, setToken] = useState<string | null>(null);

  // Check for token and user on initial load (client-side only)
  useEffect(() => {
    // Check if we are running on the client (browser)
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('access'); // Make sure key matches interceptor
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken); // Update state
        setUser(JSON.parse(storedUser));
        // The interceptor will automatically add the token to future requests
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  const login = async (email: string, password: string) => {
    try {
      // Assuming your Django backend has an endpoint like /api/accounts/login/
      const response = await api.post('/accounts/login/', { "username":email, password });
      const { access, user: userData } = response.data; // Adjust based on your Django response

      // Store the token and user data in localStorage and state
      console.log(response);
      setToken(access);
      setUser(userData);
      localStorage.setItem('access', access); // Make sure key matches interceptor
      localStorage.setItem('user', JSON.stringify(userData));

      // The interceptor will now automatically use this token for future requests
    } catch (error: any) {
      console.error("Login error:", error);
      // Optionally, throw the error to be caught by the calling component
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: string, phone: string) => {
    try {
      // Assuming your Django backend has an endpoint like /api/accounts/register/
      await api.post('/accounts/register/', { email, password, role, phone });
      // After successful signup, attempt to log the user in automatically
      await login(email, password);
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    // Clear state and localStorage
    setUser(null);
    setToken(null);
    localStorage.removeItem('access'); // Make sure key matches interceptor
    localStorage.removeItem('user');

    // The interceptor will automatically stop adding the header on future requests
    // as it checks localStorage each time.
  };

  // Provide the context value
  const value: AuthContextType = {
    user,
    token, // You can still expose the token if needed elsewhere
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};