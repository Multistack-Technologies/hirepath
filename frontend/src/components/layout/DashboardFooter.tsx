// components/layout/DashboardFooter.tsx
export default function DashboardFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 text-center sm:text-left">
            Hire-Path © {new Date().getFullYear()} All Rights Reserved
          </p>
          <div className="flex space-x-6 mt-2 sm:mt-0">
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
            <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
            <a href="/help" className="text-sm text-gray-500 hover:text-gray-700">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
}