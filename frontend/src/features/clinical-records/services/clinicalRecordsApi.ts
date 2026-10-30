import { apiClient } from '../../../services/api';
import {
  OdontogramMode,
  OdontogramResponse,
  OdontogramState,
} from '../types/odontogram.types';
import {
  PeriodontogramResponse,
  PeriodontalTooth,
} from '../types/periodontogram.types';

export const clinicalRecordsApi = {
  async getOdontogram(patientId: string): Promise<OdontogramResponse> {
    const res = await apiClient.get(`/api/v1/clinical-records/${patientId}/odontogram`);
    return res.data;
  },

  async updateOdontogram(
    patientId: string,
    mode: OdontogramMode,
    teeth: OdontogramState,
    generalNotes?: string,
  ): Promise<any> {
    const res = await apiClient.put(`/api/v1/clinical-records/${patientId}/odontogram`, {
      mode,
      teeth,
      generalNotes,
    });
    return res.data;
  },

  async getPeriodontogram(patientId: string): Promise<PeriodontogramResponse> {
    const res = await apiClient.get(`/api/v1/clinical-records/${patientId}/periodontogram`);
    return res.data;
  },

  async updatePeriodontogram(
    patientId: string,
    teeth: Record<string, PeriodontalTooth>,
    notes?: string,
  ): Promise<PeriodontogramResponse> {
    const res = await apiClient.put(`/api/v1/clinical-records/${patientId}/periodontogram`, {
      teeth,
      notes,
    });
    return res.data;
  },
};

