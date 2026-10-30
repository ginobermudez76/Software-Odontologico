import { apiClient } from '../../../services/api';
import {
  ClinicalSupply,
  ExpiringBatchItem,
  CreateSupplyPayload,
  AddBatchPayload,
  ConfigureRecipePayload,
} from '../types/inventory.types';

export const inventoryApi = {
  async getSupplies(search?: string): Promise<ClinicalSupply[]> {
    const res = await apiClient.get('/api/v1/inventory/supplies', {
      params: search ? { search } : undefined,
    });
    return res.data;
  },

  async createSupply(payload: CreateSupplyPayload): Promise<ClinicalSupply> {
    const res = await apiClient.post('/api/v1/inventory/supplies', payload);
    return res.data;
  },

  async addBatch(
    supplyId: string,
    payload: AddBatchPayload,
  ): Promise<{ batch: any; newSupplyStock: number }> {
    const res = await apiClient.post(`/api/v1/inventory/supplies/${supplyId}/batches`, payload);
    return res.data;
  },

  async getExpiringBatches(days = 60): Promise<ExpiringBatchItem[]> {
    const res = await apiClient.get('/api/v1/inventory/batches/expiring', {
      params: { days },
    });
    return res.data;
  },

  async getProcedureRecipe(procedureId: string): Promise<any> {
    const res = await apiClient.get(`/api/v1/inventory/procedures/${procedureId}/recipe`);
    return res.data;
  },

  async configureProcedureRecipe(
    procedureId: string,
    payload: ConfigureRecipePayload,
  ): Promise<any> {
    const res = await apiClient.post(`/api/v1/inventory/procedures/${procedureId}/recipe`, payload);
    return res.data;
  },

  async dischargeStock(payload: {
    procedureId: string;
    appointmentId?: string;
    chairId?: string;
    reason?: string;
  }): Promise<any> {
    const res = await apiClient.post('/api/v1/inventory/discharge', payload);
    return res.data;
  },
};
