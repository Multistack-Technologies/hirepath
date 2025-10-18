// context/SkillContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import api from '@/lib/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  demand_level?: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SkillContextType {
  // State
  allSkills: Skill[];
  userSkills: Skill[];
  popularSkills: Skill[];
  skillCategories: string[];
  isLoading: boolean;
  isUpdating: boolean;
  
  // Actions
  fetchAllSkills: () => Promise<void>;
  fetchUserSkills: (showToast?: boolean) => Promise<void>;
  fetchPopularSkills: () => Promise<void>;
  addUserSkill: (skillId: number) => Promise<boolean>;
  removeUserSkill: (skillId: number) => Promise<boolean>;
  updateUserSkills: (skillIds: number[]) => Promise<boolean>; // Renamed from setUserSkills
  searchSkills: (query: string) => Promise<Skill[]>;
  getSkillSuggestions: (currentSkills: number[]) => Promise<Skill[]>;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

export function SkillProvider({ children }: { children: ReactNode }) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<Skill[]>([]); // State variable
  const [popularSkills, setPopularSkills] = useState<Skill[]>([]);
  const [skillCategories, setSkillCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { addToast } = useToast();
  const { user } = useAuth();
  
  const previousUserRef = useRef<any>(null);
  const hasFetchedInitialData = useRef(false);

  // Fetch all available skills
  const fetchAllSkills = async () => {
    if (allSkills.length > 0 && hasFetchedInitialData.current) return;
    
    setIsLoading(true);
    try {
      const response = await api.get('/skills/');
      const skills = response.data.results || response.data;
      setAllSkills(skills);
      
      const categories = [...new Set(skills.map((skill: Skill) => skill.category))] as string[];
      setSkillCategories(categories);
    } catch (error: any) {
      console.error('Error fetching skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's skills with optional toast
  const fetchUserSkills = async (showToast: boolean = false) => {
    if (!user) {
      setUserSkills([]);
      return;
    }
    
    try {
      const response = await api.get('/accounts/profile/');
      const newUserSkills = response.data.skills || [];
      setUserSkills(newUserSkills);
      
      if (showToast) {
        addToast({
          type: 'success',
          title: 'Skills loaded!',
          message: `You have ${newUserSkills.length} skills in your profile.`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching user skills:', error);
    }
  };

  // Fetch popular skills
  const fetchPopularSkills = async () => {
    if (popularSkills.length > 0 && hasFetchedInitialData.current) return;
    
    try {
      const response = await api.get('/skills/popular/');
      setPopularSkills(response.data.results || response.data);
    } catch (error: any) {
      console.error('Error fetching popular skills:', error);
    }
  };

  // Add skill to user profile
  const addUserSkill = async (skillId: number): Promise<boolean> => {
    setIsUpdating(true);
    try {
      await api.post('/accounts/skills/add/', { skill_id: skillId });
      
      await fetchUserSkills(false);
      
      addToast({
        type: 'success',
        title: 'Skill added!',
        message: 'Skill has been added to your profile.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding skill:', error);
      addToast({
        type: 'error',
        title: 'Failed to add skill',
        message: error.response?.data?.error || 'Please try again.',
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove skill from user profile
  const removeUserSkill = async (skillId: number): Promise<boolean> => {
    setIsUpdating(true);
    try {
      await api.delete(`/accounts/skills/remove/${skillId}/`);
      
      await fetchUserSkills(false);
      
      addToast({
        type: 'success',
        title: 'Skill removed!',
        message: 'Skill has been removed from your profile.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error removing skill:', error);
      addToast({
        type: 'error',
        title: 'Failed to remove skill',
        message: error.response?.data?.error || 'Please try again.',
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Set user skills (replace all) - RENAMED to avoid conflict
  const updateUserSkills = async (skillIds: number[]): Promise<boolean> => {
    setIsUpdating(true);
    try {
      await api.post('/accounts/skills/set/', { skill_ids: skillIds });
      
      await fetchUserSkills(false);
      
      addToast({
        type: 'success',
        title: 'Skills updated!',
        message: 'Your skills have been updated successfully.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error setting skills:', error);
      addToast({
        type: 'error',
        title: 'Failed to update skills',
        message: error.response?.data?.error || 'Please try again.',
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Search skills
  const searchSkills = async (query: string): Promise<Skill[]> => {
    try {
      const response = await api.get(`/skills/?search=${encodeURIComponent(query)}`);
      return response.data.results || response.data;
    } catch (error: any) {
      console.error('Error searching skills:', error);
      return [];
    }
  };

  // Get skill suggestions based on current skills
  const getSkillSuggestions = async (currentSkills: number[]): Promise<Skill[]> => {
    try {
      const response = await api.get('/skills/suggestions/', {
        params: { current_skills: currentSkills.join(',') }
      });
      return response.data.results || response.data;
    } catch (error: any) {
      console.error('Error getting skill suggestions:', error);
      return [];
    }
  };

  // Initial data fetch - only once
  useEffect(() => {
    if (!hasFetchedInitialData.current) {
      fetchAllSkills();
      fetchPopularSkills();
      hasFetchedInitialData.current = true;
    }
  }, []);

  // Fetch user skills when user changes - with proper comparison
  useEffect(() => {
    if (user && user.id !== previousUserRef.current?.id) {
      fetchUserSkills(false);
      previousUserRef.current = user;
    } else if (!user) {
      setUserSkills([]);
      previousUserRef.current = null;
    }
  }, [user]);

  const value: SkillContextType = {
    // State
    allSkills,
    userSkills,
    popularSkills,
    skillCategories,
    isLoading,
    isUpdating,
    
    // Actions
    fetchAllSkills,
    fetchUserSkills,
    fetchPopularSkills,
    addUserSkill,
    removeUserSkill,
    updateUserSkills, // Use the renamed function
    searchSkills,
    getSkillSuggestions,
  };

  return (
    <SkillContext.Provider value={value}>
      {children}
    </SkillContext.Provider>
  );
}

export const useSkills = () => {
  const context = useContext(SkillContext);
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillProvider');
  }
  return context;
};