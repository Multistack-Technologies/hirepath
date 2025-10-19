// components/jobs/CertificateProvidersModal.tsx
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { CertificateProvider } from '@/types';
import api from '@/lib/api';

interface CertificateProvidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProvidersSelected: (providers: CertificateProvider[]) => void;
  existingProviders?: CertificateProvider[];
  availableProviders: CertificateProvider[];
  isLoading: boolean;
}

export default function CertificateProvidersModal({ 
  isOpen, 
  onClose, 
  onProvidersSelected,
  existingProviders = [] ,
  
}: CertificateProvidersModalProps) {
  const [availableProviders, setAvailableProviders] = useState<CertificateProvider[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<CertificateProvider[]>(existingProviders);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset and fetch when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedProviders(existingProviders);
      fetchAvailableProviders();
    }
  }, [isOpen, existingProviders]);

  const fetchAvailableProviders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<CertificateProvider[]>('/certificate-providers/');
      setAvailableProviders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch certificate providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderToggle = (provider: CertificateProvider) => {
    setSelectedProviders(prev => {
      const isSelected = prev.some(p => p.id === provider.id);
      if (isSelected) {
        return prev.filter(p => p.id !== provider.id);
      } else {
        return [...prev, provider];
      }
    });
  };

  const handleSave = () => {
    onProvidersSelected(selectedProviders);
    onClose();
  };

  const handleClearAll = () => {
    setSelectedProviders([]);
  };

  const filteredProviders = availableProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (provider.description && provider.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Preferred Certificate Providers"
      size="lg"
    >
      <div className="p-6 space-y-4">
        {/* Search Input */}
        <div className="flex-shrink-0">
          <input
            type="text"
            placeholder="Search certificate providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Providers List - Scrollable area */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading certificate providers...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProviders.map((provider) => {
                const isSelected = selectedProviders.some(p => p.id === provider.id);
                
                return (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderToggle(provider)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-purple-100 border-purple-500 text-purple-800 shadow-sm'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-purple-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{provider.name}</div>
                        {provider.description && (
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {provider.description}
                          </div>
                        )}
                        {provider.website && (
                          <div className="text-xs text-blue-600 mt-1">
                            {provider.website}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {!isLoading && filteredProviders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p>No certificate providers found matching your search.</p>
            </div>
          )}
        </div>

        {/* Selected Providers Preview */}
        {selectedProviders.length > 0 && (
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Selected Providers ({selectedProviders.length})
              </h4>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {selectedProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between px-3 py-2 bg-purple-50 border border-purple-200 rounded text-sm"
                >
                  <div>
                    <div className="font-medium text-purple-800">{provider.name}</div>
                    {provider.description && (
                      <div className="text-xs text-purple-600 line-clamp-1">
                        {provider.description}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleProviderToggle(provider)}
                    className="text-purple-600 hover:text-purple-800 text-lg leading-none"
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
            {selectedProviders.length} provider{selectedProviders.length !== 1 ? 's' : ''} selected
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
              Add Selected Providers
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}