import { apiClient } from '../../../services/api';
import {
  Appointment,
  ChangeStatusPayload,
  CreateAppointmentPayload,
  DentalChair,
  UpdateAppointmentPayload,
} from '../types/appointment.types';

export interface GetAppointmentsParams {
  branchId?: string;
  chairId?: string;
  doctorId?: string;
  patientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentsResponse {
  data: Appointment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const appointmentsApi = {
  async getAppointments(params: GetAppointmentsParams = {}): Promise<AppointmentsResponse> {
    const response = await apiClient.get('/api/v1/appointments', { params });
    return response.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await apiClient.get(`/api/v1/appointments/${id}`);
    return response.data;
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    const response = await apiClient.post('/api/v1/appointments', payload);
    return response.data;
  },

  async updateAppointment(id: string, payload: UpdateAppointmentPayload): Promise<Appointment> {
    const response = await apiClient.put(`/api/v1/appointments/${id}`, payload);
    return response.data;
  },

  async changeStatus(id: string, payload: ChangeStatusPayload): Promise<Appointment> {
    const response = await apiClient.patch(`/api/v1/appointments/${id}/status`, payload);
    return response.data;
  },

  async deleteAppointment(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/v1/appointments/${id}`);
    return response.data;
  },

  async getChairsLiveStatus(branchId: string): Promise<DentalChair[]> {
    const response = await apiClient.get('/api/v1/appointments/chairs/status', {
      params: { branchId },
    });
    return response.data;
  },
};
