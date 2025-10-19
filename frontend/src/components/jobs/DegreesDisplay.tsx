// components/jobs/DegreesDisplay.tsx
import { Degree } from '@/types';
import Button from '@/components/Button';

interface DegreesDisplayProps {
  degrees: Degree[];
  onEdit: () => void;
  onClear: () => void;
}

export default function DegreesDisplay({ 
  degrees, 
  onEdit, 
  onClear 
}: DegreesDisplayProps) {
  if (degrees.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-[#130160]">
            Preferred Degrees
          </label>
          <Button
            variant="primary"
            size="sm"
            onClick={onEdit}
          >
            Add Degrees
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          No degrees selected. Add preferred educational qualifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[#130160]">
          Preferred Degrees ({degrees.length})
        </label>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
          >
            Edit Degrees
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onClear}
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {degrees.map((degree) => (
          <div
            key={degree.id}
            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div>
              <div className="font-medium text-green-800">{degree.name}</div>
              <div className="text-sm text-green-600">{degree.issuer_name}</div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500">
        Candidates with these degrees will be given preference.
      </p>
    </div>
  );
}