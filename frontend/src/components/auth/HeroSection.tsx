// components/auth/HeroSection.tsx
interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function HeroSection({
  title = "Welcome Back!",
  subtitle = "Connect with opportunities that match your skills and aspirations",
  className = "",
}: HeroSectionProps) {
  return (
    <div className={`hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden rounded-tr-4xl rounded-br-4xl ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="text-white text-center">
          <h2 className="text-4xl font-bold mb-6">{title}</h2>
          <p className="text-xl opacity-90">{subtitle}</p>
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-indigo-400 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-white to-transparent"></div>
    </div>
  );
}