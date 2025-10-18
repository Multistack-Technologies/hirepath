import { useState, useEffect } from 'react';
import SelectionModal from '@/components/SelectionModal';
import { Skill } from '@/types';
import api from '@/lib/api';

interface SkillsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillsSelected: (skillIds: number[]) => void;
  initialSelectedIds?: number[];
}

export default function SkillsSelectionModal({
  isOpen,
  onClose,
  onSkillsSelected,
  initialSelectedIds = []
}: SkillsSelectionModalProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSkills();
    }
  }, [isOpen]);

  const fetchAvailableSkills = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Skill[]>('/skills/');
      setAvailableSkills(response.data || []);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      onItemsSelected={onSkillsSelected}
      initialSelectedIds={initialSelectedIds}
      availableItems={availableSkills}
      title="Select Skills"
      searchPlaceholder="Search skills..."
      isLoading={isLoading}
      emptyStateMessage="No skills found matching your search."
    />
  );
}