// context/AuthContext.tsx
'use client'; 
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'GRADUATE' | 'RECRUITER';
  phone_number: string | null;
  phone: string | null;
  avatarUrl: string | null;
  linkedin_url: string | null;
  location: any;
  bio: string | null;
  job_title: string | null;
  skills: any[];
  target_job_roles: any[];
  current_job_role: any;
  educations: any[];
  certificates: any[];
  work_experiences: any[];
  date_joined: string;
  last_login: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface SignupData {
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  linkedin_url?: string;
  bio?: string;
  job_title?: string;
  skills?: number[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('access');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid by fetching fresh profile
          try {
            await api.get('/accounts/profile/');
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('access');
            localStorage.removeItem('user');
            localStorage.removeItem('refresh');
            setToken(null);
            setUser(null);
          }
        }
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/accounts/login/', { 
        username: email, 
        password 
      });
      
      const { access, refresh, user: userData } = response.data;

      setToken(access);
      setUser(userData);
      
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Login failed. Please try again.'
      );
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      const payload = {
        username: userData.email,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password,
        password2: userData.password,
        role: userData.role,
      };

      const response = await api.post('/accounts/register/', payload);
      
      // Auto-login after successful registration
      await login(userData.email, userData.password);
      
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle validation errors from Django
      if (error.response?.data) {
        const errors = error.response.data;
        const errorMessage = Object.values(errors).flat().join(', ');
        throw new Error(errorMessage);
      }
      
      throw new Error('Registration failed. Please try again.');
    }
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      if (!refresh) throw new Error('No refresh token');

      const response = await api.post('/accounts/token/refresh/', {
        refresh
      });

      const newToken = response.data.access;
      setToken(newToken);
      localStorage.setItem('access', newToken);
      
      return newToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};