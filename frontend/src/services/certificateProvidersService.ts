// services/certificateProvidersService.ts
import api from '@/lib/api';
import { CertificateProvider } from '@/types';

class CertificateProvidersService {
  async getCertificateProviders(): Promise<CertificateProvider[]> {
    const response = await api.get<CertificateProvider[]>('/certificate-providers/');
    return response.data;
  }
}

export const certificateProvidersService = new CertificateProvidersService();