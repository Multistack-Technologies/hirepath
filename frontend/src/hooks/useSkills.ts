import { useState, useCallback, useEffect } from 'react';
import { jobsService } from '@/lib/api/jobsService';
import { Skill } from '@/types';

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jobsService.getAllSkills();
      setSkills(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load skills';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSkills();
  }, [fetchAllSkills]);

  const getSkillName = useCallback((skillId: number): string => {
    const skill = skills.find(s => s.id === skillId);
    return skill?.name || 'Unknown Skill';
  }, [skills]);

  return {
    skills,
    isLoading,
    error,
    getSkillName,
    refetch: fetchAllSkills,
  };
};