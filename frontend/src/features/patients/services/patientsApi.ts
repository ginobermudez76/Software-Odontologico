import { apiClient } from '../../../services/api';
import { PatientListItem, PatientDetail, PatientFormData } from '../types/patient.types';

export const patientsApi = {
  findAll: async (search: string = '', page: number = 1, limit: number = 10) => {
    const res = await apiClient.get('/api/v1/patients', {
      params: { search, page, limit },
    });
    return res.data as {
      data: PatientListItem[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    };
  },

  findOne: async (id: string) => {
    const res = await apiClient.get(`/api/v1/patients/${id}`);
    return res.data as PatientDetail;
  },

  create: async (data: PatientFormData) => {
    const res = await apiClient.post('/api/v1/patients', data);
    return res.data;
  },

  update: async (id: string, data: Partial<PatientFormData>) => {
    const res = await apiClient.put(`/api/v1/patients/${id}`, data);
    return res.data;
  },

  remove: async (id: string) => {
    const res = await apiClient.delete(`/api/v1/patients/${id}`);
    return res.data;
  },
};

