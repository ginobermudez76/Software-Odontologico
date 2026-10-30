import { apiClient } from '../../../services/api';
import {
  TreatmentPlan,
  CreateTreatmentPlanPayload,
  ConvertPlanItemPayload,
  CommissionRule,
  CommissionSettlement,
  SettlementPreview,
} from '../types/treatment-plans-commissions.types';

export const treatmentPlansCommissionsApi = {
  // Presupuestos Clínicos
  async getPatientTreatmentPlans(patientId: string): Promise<TreatmentPlan[]> {
    const res = await apiClient.get(`/api/v1/treatment-plans/patient/${patientId}`);
    return res.data;
  },

  async getTreatmentPlan(planId: string): Promise<TreatmentPlan> {
    const res = await apiClient.get(`/api/v1/treatment-plans/${planId}`);
    return res.data;
  },

  async createTreatmentPlan(
    payload: CreateTreatmentPlanPayload,
  ): Promise<TreatmentPlan> {
    const res = await apiClient.post('/api/v1/treatment-plans', payload);
    return res.data;
  },

  async updatePlanStatus(
    planId: string,
    status: 'APROBADO' | 'RECHAZADO' | 'VENCIDO',
    rejectionReason?: string,
  ): Promise<TreatmentPlan> {
    const res = await apiClient.patch(`/api/v1/treatment-plans/${planId}/status`, {
      status,
      rejectionReason,
    });
    return res.data;
  },

  async convertItemToAppointment(
    planId: string,
    itemId: string,
    payload: ConvertPlanItemPayload,
  ): Promise<{ appointment: any; item: any }> {
    const res = await apiClient.post(
      `/api/v1/treatment-plans/${planId}/items/${itemId}/convert-to-appointment`,
      payload,
    );
    return res.data;
  },

  // Reglas de Comisión y Liquidaciones
  async getDoctorCommissionRules(doctorId: string): Promise<CommissionRule[]> {
    const res = await apiClient.get(`/api/v1/commissions/rules/doctor/${doctorId}`);
    return res.data;
  },

  async configureCommissionRule(payload: {
    doctorId: string;
    procedureId?: string;
    ruleType: 'PERCENTAGE_NET' | 'FIXED_AMOUNT';
    percentage?: number;
    fixedAmount?: number;
  }): Promise<CommissionRule> {
    const res = await apiClient.post('/api/v1/commissions/rules', payload);
    return res.data;
  },

  async previewSettlement(payload: {
    doctorId: string;
    periodStart: string;
    periodEnd: string;
  }): Promise<SettlementPreview> {
    const res = await apiClient.post('/api/v1/commissions/settlements/preview', payload);
    return res.data;
  },

  async generateSettlement(payload: {
    doctorId: string;
    periodStart: string;
    periodEnd: string;
    notes?: string;
  }): Promise<CommissionSettlement> {
    const res = await apiClient.post('/api/v1/commissions/settlements', payload);
    return res.data;
  },

  async getSettlements(doctorId?: string): Promise<CommissionSettlement[]> {
    const res = await apiClient.get('/api/v1/commissions/settlements', {
      params: doctorId ? { doctorId } : undefined,
    });
    return res.data;
  },

  async paySettlement(settlementId: string): Promise<CommissionSettlement> {
    const res = await apiClient.patch(`/api/v1/commissions/settlements/${settlementId}/pay`);
    return res.data;
  },
};

