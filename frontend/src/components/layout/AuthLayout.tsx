// components/layout/AuthLayout.tsx
interface AuthLayoutProps {
  children: React.ReactNode;
  heroSection?: React.ReactNode;
}

export default function AuthLayout({ children, heroSection }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {heroSection}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white">
        {children}
      </div>
    </div>
  );
}