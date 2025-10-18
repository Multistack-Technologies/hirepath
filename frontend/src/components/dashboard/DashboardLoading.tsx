// components/dashboard/DashboardLoading.tsx
interface DashboardLoadingProps {
  message?: string;
}

export default function DashboardLoading({ 
  message = "Loading your dashboard..." 
}: DashboardLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Please wait</h2>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}