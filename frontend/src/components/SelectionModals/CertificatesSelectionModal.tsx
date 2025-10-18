import { useState, useEffect } from 'react';
import SelectionModal from '@/components/SelectionModal';
import { Certificate } from '@/types';
import api from '@/lib/api';

interface CertificatesSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCertificatesSelected: (certificateIds: number[]) => void;
  initialSelectedIds?: number[];
}

export default function CertificatesSelectionModal({
  isOpen,
  onClose,
  onCertificatesSelected,
  initialSelectedIds = []
}: CertificatesSelectionModalProps) {
  const [availableCertificates, setAvailableCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCertificates();
    }
  }, [isOpen]);

  const fetchAvailableCertificates = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Certificate[]>('/certificates/');
      setAvailableCertificates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCertificateItem = (certificate: Certificate, isSelected: boolean, isExisting: boolean) => (
    <button
      key={certificate.id}
      onClick={() => {/* handled by parent */}}
      className={`p-3 rounded-lg border text-left transition-all w-full ${
        isSelected
          ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-sm'
          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:shadow-sm'
      } ${isExisting ? 'border-green-200 bg-green-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{certificate.name}</span>
        <div className="flex items-center">
          {isExisting && (
            <span className="text-xs text-green-600 mr-2">✓</span>
          )}
          {isSelected && (
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      {certificate.issuing_organization && (
        <p className="text-xs text-gray-600 mt-1">{certificate.issuing_organization}</p>
      )}
      {isExisting && !isSelected && (
        <span className="text-xs text-green-600 mt-1">Already selected</span>
      )}
    </button>
  );

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      onItemsSelected={onCertificatesSelected}
      initialSelectedIds={initialSelectedIds}
      availableItems={availableCertificates}
      title="Select Certificates"
      searchPlaceholder="Search certificates..."
      isLoading={isLoading}
      renderItem={renderCertificateItem}
      emptyStateMessage="No certificates found matching your search."
    />
  );
}