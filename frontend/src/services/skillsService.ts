// services/skillsService.ts
import api from '@/lib/api';
import { Skill } from '@/types';

class SkillsService {
  async getSkills(): Promise<Skill[]> {
    const response = await api.get<Skill[]>('/skills/');
    return response.data;
  }
}

export const skillsService = new SkillsService();