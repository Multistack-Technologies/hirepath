import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';

interface ErrorStateProps {
  companyError?: string | null;
}

export default function ErrorState({ companyError }: ErrorStateProps) {
  const router = useRouter();

  return (
    <DashboardLayout pageTitle="Post New Vacancy">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 mt-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Company Profile Required</h3>
          <p className="mt-2 text-gray-600">
            {companyError || "You need to create a company profile before posting jobs."}
          </p>
          <div className="mt-6 space-y-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/profile/company/create")}
              className="w-full"
            >
              Create Company Profile
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.push("/jobs")}
              className="w-full"
            >
              Back to My Jobs
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}