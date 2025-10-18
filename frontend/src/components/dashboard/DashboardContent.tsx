// components/dashboard/DashboardContent.tsx
'use client';
import { useAuth, User } from '@/context/AuthContext';
import RecruiterDashboard from '@/components/dashboard/RecruiterDashboard';
import GraduateDashboard from '@/components/dashboard/GraduateDashboard';
import DashboardError from '@/components/dashboard/DashboardError';




export default function DashboardContent() {
    const { user } = useAuth();

  // Check if user is null or undefined
  if (!user) {
    return (
      <DashboardError 
        message="User information not available. Please log in again." 
        showRedirect={true}
        redirectUrl="/login"
      />
    );
  }

  // Check if user has a role with more detailed logging
  if (!user.role) {
    console.log('🔐 DashboardContent - User object without role:', JSON.stringify(user, null, 2));
    return (
      <DashboardError 
        message={`User role not found. Available properties: ${Object.keys(user).join(', ')}`}
        showRedirect={true}
      />
    );
  }

  // Validate user role
  if (!['RECRUITER', 'GRADUATE'].includes(user.role)) {
    return (
      <DashboardError 
        message={`Access Denied. Invalid user role: ${user.role}`} 
        showRedirect={true}
      />
    );
  }

  // Render appropriate dashboard based on role
  switch (user.role) {
    case 'RECRUITER':
      return <RecruiterDashboard />;
    case 'GRADUATE':
      return <GraduateDashboard />;
    default:
      return (
        <DashboardError 
          message="Unknown user role. Please contact support." 
          showRedirect={true}
        />
      );
  }
}