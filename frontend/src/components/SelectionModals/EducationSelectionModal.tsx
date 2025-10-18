import { useState, useEffect } from 'react';
import SelectionModal from '@/components/SelectionModal';
import { Degree } from '@/types';
import api from '@/lib/api';

interface EducationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEducationSelected: (degreeIds: number[]) => void;
  initialSelectedIds?: number[];
}

export default function EducationSelectionModal({
  isOpen,
  onClose,
  onEducationSelected,
  initialSelectedIds = []
}: EducationSelectionModalProps) {
  const [availableDegrees, setAvailableDegrees] = useState<Degree[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableDegrees();
    }
  }, [isOpen]);

  const fetchAvailableDegrees = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Degree[]>('/degrees/');
      setAvailableDegrees(response.data || []);
    } catch (error) {
      console.error('Failed to fetch degrees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEducationItem = (degree: Degree, isSelected: boolean, isExisting: boolean) => (
    <button
      key={degree.id}
      onClick={() => {/* handled by parent */}}
      className={`p-3 rounded-lg border text-left transition-all w-full ${
        isSelected
          ? 'bg-green-100 border-green-500 text-green-800 shadow-sm'
          : 'bg-white border-gray-300 text-gray-700 hover:border-green-300 hover:shadow-sm'
      } ${isExisting ? 'border-green-200 bg-green-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{degree.name}</span>
        <div className="flex items-center">
          {isExisting && (
            <span className="text-xs text-green-600 mr-2">✓</span>
          )}
          {isSelected && (
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      {/* {degree.field_of_study && (
        <p className="text-xs text-gray-600 mt-1">{degree.field_of_study}</p>
      )}
      {degree.institution && (
        <p className="text-xs text-gray-600">{degree.institution}</p>
      )} */}
      {isExisting && !isSelected && (
        <span className="text-xs text-green-600 mt-1">Already selected</span>
      )}
    </button>
  );

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      onItemsSelected={onEducationSelected}
      initialSelectedIds={initialSelectedIds}
      availableItems={availableDegrees}
      title="Select Education"
      searchPlaceholder="Search degrees or courses..."
      isLoading={isLoading}
      renderItem={renderEducationItem}
      emptyStateMessage="No degrees or courses found matching your search."
    />
  );
}