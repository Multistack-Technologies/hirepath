// components/analysis/BasicInfoSection.tsx
import { useAuth } from '@/context/AuthContext';

interface BasicInfoSectionProps {
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function BasicInfoSection({ user }: BasicInfoSectionProps) {
  const { user: authUser } = useAuth();
  
  const displayUser = user || authUser;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Your Basic Info</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-500">Name</span>
          <span className="text-sm text-gray-900">
            {/* {displayUser?.first_name} {displayUser?.last_name} */}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-500">Email</span>
          <span className="text-sm text-gray-900">{displayUser?.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-500">Role</span>
          {/* <span className="text-sm text-gray-900 capitalize">{displayUser?.role?.toLowerCase()}</span> */}
        </div>
      </div>
    </div>
  );
}