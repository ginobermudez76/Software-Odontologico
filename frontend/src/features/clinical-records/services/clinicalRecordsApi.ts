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
import {
  EvolutionNotesResponse,
  EvolutionNote,
  CreateEvolutionNotePayload,
  UpdateEvolutionNotePayload,
  CreateAdendaPayload,
  NoteAdenda,
} from '../types/evolution-note.types';

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

  async getEvolutionNotes(patientId: string): Promise<EvolutionNotesResponse> {
    const res = await apiClient.get(`/api/v1/clinical-records/${patientId}/notes`);
    return res.data;
  },

  async createEvolutionNote(
    patientId: string,
    payload: CreateEvolutionNotePayload,
  ): Promise<EvolutionNote> {
    const res = await apiClient.post(`/api/v1/clinical-records/${patientId}/notes`, payload);
    return res.data;
  },

  async updateEvolutionNote(
    noteId: string,
    payload: UpdateEvolutionNotePayload,
  ): Promise<EvolutionNote> {
    const res = await apiClient.put(`/api/v1/clinical-records/notes/${noteId}`, payload);
    return res.data;
  },

  async createAdenda(
    noteId: string,
    payload: CreateAdendaPayload,
  ): Promise<NoteAdenda> {
    const res = await apiClient.post(`/api/v1/clinical-records/notes/${noteId}/adendas`, payload);
    return res.data;
  },
};


