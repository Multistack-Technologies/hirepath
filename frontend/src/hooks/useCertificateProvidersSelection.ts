// hooks/useCertificateProvidersSelection.ts
import { useState, useEffect } from 'react';
import { CertificateProvider } from '@/types';
import { certificateProvidersService } from '@/services/certificateProvidersService';

export const useCertificateProvidersSelection = (initialProviders: CertificateProvider[] = []) => {
  const [availableProviders, setAvailableProviders] = useState<CertificateProvider[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<CertificateProvider[]>(initialProviders);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const providers = await certificateProvidersService.getCertificateProviders();
      setAvailableProviders(providers);
    } catch (error) {
      console.error('Failed to fetch certificate providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvidersSelected = (providers: CertificateProvider[]) => {
    setSelectedProviders(providers);
  };

  const handleClearProviders = () => {
    setSelectedProviders([]);
  };

  const getProvidersIds = (): number[] => {
    return selectedProviders.map(provider => provider.id);
  };

  return {
    availableProviders,
    selectedProviders,
    isLoading,
    handleProvidersSelected,
    handleClearProviders,
    getProvidersIds,
  };
};