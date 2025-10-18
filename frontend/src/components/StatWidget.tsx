// src/components/StatWidget.tsx
interface StatWidgetProps {
  title: string;
  value: string | number;
  color: 'blue' | 'purple' | 'orange' | 'indigo'; // Define color variants
  className?: string; // Allow additional Tailwind classes
  description?:string;
}

export default function StatWidget({ title, value, color, className = '',description }: StatWidgetProps) {
  const colorClasses = {
    blue: 'bg-[#AFECFE] text-blue-900',
    purple: 'bg-[#BEAFFE] text-purple-900',
    orange: 'bg-[#FFD6AD] text-orange-900',
    indigo: 'bg-[#130160] text-white',
  };

  return (
    <div className={`${colorClasses[color]} p-4 rounded-lg ${className}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-2xl font-bold">{value? value : 0}</p>
      <p className="">{description}</p>
    </div>
  );
}