// components/jobs/DegreesModal.tsx
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { Degree } from '@/types';
import api from '@/lib/api';

interface DegreesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDegreesSelected: (degrees: Degree[]) => void;
  existingDegrees?: Degree[];
  availableDegrees: Degree[];
  isLoading: boolean;
}

export default function DegreesModal({ 
  isOpen, 
  onClose, 
  onDegreesSelected,
  existingDegrees = [],
  
  
}: DegreesModalProps) {
  const [availableDegrees, setAvailableDegrees] = useState<Degree[]>([]);
  const [selectedDegrees, setSelectedDegrees] = useState<Degree[]>(existingDegrees);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset and fetch when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDegrees(existingDegrees);
      fetchAvailableDegrees();
    }
  }, [isOpen, existingDegrees]);

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

  const handleDegreeToggle = (degree: Degree) => {
    setSelectedDegrees(prev => {
      const isSelected = prev.some(d => d.id === degree.id);
      if (isSelected) {
        return prev.filter(d => d.id !== degree.id);
      } else {
        return [...prev, degree];
      }
    });
  };

  const handleSave = () => {
    onDegreesSelected(selectedDegrees);
    onClose();
  };

  const handleClearAll = () => {
    setSelectedDegrees([]);
  };

  const filteredDegrees = availableDegrees.filter(degree =>
    degree.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    degree.issuer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Preferred Degrees"
      size="lg"
    >
      <div className="p-6 space-y-4">
        {/* Search Input */}
        <div className="flex-shrink-0">
          <input
            type="text"
            placeholder="Search degrees or institutions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Degrees List - Scrollable area */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading degrees...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDegrees.map((degree) => {
                const isSelected = selectedDegrees.some(d => d.id === degree.id);
                
                return (
                  <button
                    key={degree.id}
                    onClick={() => handleDegreeToggle(degree)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-green-100 border-green-500 text-green-800 shadow-sm'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-green-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{degree.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {degree.issuer_name}
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {!isLoading && filteredDegrees.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
              <p>No degrees found matching your search.</p>
            </div>
          )}
        </div>

        {/* Selected Degrees Preview */}
        {selectedDegrees.length > 0 && (
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Selected Degrees ({selectedDegrees.length})
              </h4>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {selectedDegrees.map((degree) => (
                <div
                  key={degree.id}
                  className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded text-sm"
                >
                  <div>
                    <div className="font-medium text-green-800">{degree.name}</div>
                    <div className="text-xs text-green-600">{degree.issuer_name}</div>
                  </div>
                  <button
                    onClick={() => handleDegreeToggle(degree)}
                    className="text-green-600 hover:text-green-800 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
          <div className="text-sm text-gray-500">
            {selectedDegrees.length} degree{selectedDegrees.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
            >
              Add Selected Degrees
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}