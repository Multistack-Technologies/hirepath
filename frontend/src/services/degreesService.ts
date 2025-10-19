// services/degreesService.ts
import api from '@/lib/api';
import { Degree } from '@/types';

class DegreesService {
  async getDegrees(): Promise<Degree[]> {
    const response = await api.get<Degree[]>('/degrees/');
    return response.data;
  }
}

export const degreesService = new DegreesService();