
'use client'; 
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api'; 


interface User {
  id: number;
  email: string;
  role: 'GRADUATE' | 'RECRUITER';
  phone: string;
  avatarUrl:string;
}


interface AuthContextType {
  user: User | null;
  token: string | null; 
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: string, fullname: string, surname :string) => Promise<void>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

 
  useEffect(() => {

    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('access'); 
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken); 
        setUser(JSON.parse(storedUser));
        
      }
    }
  }, []); 

  const login = async (email: string, password: string) => {
    try {
 
      const response = await api.post('/accounts/login/', { "username":email, password });
      const { access, user: userData } = response.data; 

     
      console.log(response);
      setToken(access);
      setUser(userData);
      localStorage.setItem('access', access); 
      localStorage.setItem('user', JSON.stringify(userData));

     
    } catch (error: any) {
      console.error("Login error:", error);
      // Optionally, throw the error to be caught by the calling component
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: string, fullname: string, surname :string) => {
    try {

      var body = {
    "username": email,
    "email": email,
    "first_name": fullname,
    "last_name": surname,
    "password": password,
    "password2": password,
    "role": role
      }

      await api.post('/accounts/register/', body);
      await login(email, password);

    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access'); 
    localStorage.removeItem('user');

  };

  const value: AuthContextType = {
    user,
    token, 
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