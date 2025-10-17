'use client'; 

import MainLoader from '@/components/Mainloader';
import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation'; 
import { useEffect } from 'react';

export default function Home() {
  const { user } = useAuth(); 
  const router = useRouter();

 
  useEffect(() => {

    if (!user) {
   
      router.push('/login');
    } else {
 
      router.push('/dashboard');
    }
  }, [user, router]); 

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <MainLoader/>
    </div>
  );
}