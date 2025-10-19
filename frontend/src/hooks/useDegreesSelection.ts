// hooks/useDegreesSelection.ts
import { useState, useEffect } from 'react';
import { Degree } from '@/types';
import { degreesService } from '@/services/degreesService';

export const useDegreesSelection = (initialDegrees: Degree[] = []) => {
  const [availableDegrees, setAvailableDegrees] = useState<Degree[]>([]);
  const [selectedDegrees, setSelectedDegrees] = useState<Degree[]>(initialDegrees);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    setIsLoading(true);
    try {
      const degrees = await degreesService.getDegrees();
      setAvailableDegrees(degrees);
    } catch (error) {
      console.error('Failed to fetch degrees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDegreesSelected = (degrees: Degree[]) => {
    setSelectedDegrees(degrees);
  };

  const handleClearDegrees = () => {
    setSelectedDegrees([]);
  };

  const getDegreesIds = (): number[] => {
    return selectedDegrees.map(degree => degree.id);
  };

  return {
    availableDegrees,
    selectedDegrees,
    isLoading,
    handleDegreesSelected,
    handleClearDegrees,
    getDegreesIds,
  };
};