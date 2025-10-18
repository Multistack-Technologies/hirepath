// components/dashboard/DashboardError.tsx
interface DashboardErrorProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function DashboardError({ message, onRetry, showRetry = true }: DashboardErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <svg className="h-6 w-6 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800">Unable to load dashboard</h3>
          <p className="text-red-700 mt-1">{message}</p>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}