// components/jobs/CertificateProvidersDisplay.tsx
import { CertificateProvider } from '@/types';
import Button from '@/components/Button';

interface CertificateProvidersDisplayProps {
  providers: CertificateProvider[];
  onEdit: () => void;
  onClear: () => void;
}

export default function CertificateProvidersDisplay({ 
  providers, 
  onEdit, 
  onClear 
}: CertificateProvidersDisplayProps) {
  if (providers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-[#130160]">
            Preferred Certificates
          </label>
          <Button
            variant="primary"
            size="sm"
            onClick={onEdit}
          >
            Add Certificates
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          No certificate providers selected. Add preferred certification providers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[#130160]">
          Preferred Certificates ({providers.length})
        </label>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
          >
            Edit Certificates
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
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
          >
            <div className="flex-1">
              <div className="font-medium text-purple-800">{provider.name}</div>
              {provider.description && (
                <div className="text-sm text-purple-600 line-clamp-2">
                  {provider.description}
                </div>
              )}
              {provider.website && (
                <div className="text-xs text-blue-600 mt-1">
                  {provider.website}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500">
        Candidates with certificates from these providers will be given preference.
      </p>
    </div>
  );
}