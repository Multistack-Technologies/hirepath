interface InfoFieldProps {
  label: string;
  value: string | null | undefined;
}

export default function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-1">{value || 'Not provided'}</p>
    </div>
  );
}