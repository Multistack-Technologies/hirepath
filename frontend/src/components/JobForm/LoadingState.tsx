import DashboardLayout from '@/components/layout/DashboardLayout';

export default function LoadingState() {
  return (
    <DashboardLayout pageTitle="Post New Vacancy">
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-lg text-gray-600 mt-4">
            Loading company information...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}