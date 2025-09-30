// src/components/StatWidget.tsx
interface StatWidgetProps {
  title: string;
  value: string | number;
  color: 'blue' | 'purple' | 'orange' | 'indigo'; // Define color variants
  className?: string; // Allow additional Tailwind classes
}

export default function StatWidget({ title, value, color, className = '' }: StatWidgetProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-800',
    purple: 'bg-purple-50 text-purple-800',
    orange: 'bg-orange-50 text-orange-800',
    indigo: 'bg-indigo-50 text-indigo-800',
  };

  return (
    <div className={`${colorClasses[color]} p-4 rounded-lg ${className}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}