// components/dashboard/DashboardError.tsx
'use client';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

interface DashboardErrorProps {
  message: string;
  showRedirect?: boolean;
  redirectUrl?: string;
  redirectText?: string;
}

export default function DashboardError({
  message,
  showRedirect = false,
  redirectUrl = '/login',
  redirectText = 'Go to Login'
}: DashboardErrorProps) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg 
            className="h-8 w-8 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {showRedirect && (
          <Button
            onClick={handleRedirect}
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {redirectText}
          </Button>
        )}
      </div>
    </div>
  );
}