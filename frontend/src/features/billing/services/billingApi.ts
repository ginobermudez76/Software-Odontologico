import { apiClient } from '../../../services/api';
import {
  BlindCloseResult,
  CashShift,
  CreateInvoicePayload,
  Invoice,
} from '../types/billing.types';

export const billingApi = {
  async openShift(branchId: string, openingBalance: number, notes?: string): Promise<CashShift> {
    const res = await apiClient.post('/api/v1/billing/shifts/open', {
      branchId,
      openingBalance,
      notes,
    });
    return res.data;
  },

  async getCurrentShift(branchId: string): Promise<CashShift | null> {
    const res = await apiClient.get('/api/v1/billing/shifts/current', {
      params: { branchId },
    });
    return res.data;
  },

  async closeBlindShift(
    shiftId: string,
    declaredPhysicalBalance: number,
    notes?: string,
  ): Promise<BlindCloseResult> {
    const res = await apiClient.post(`/api/v1/billing/shifts/${shiftId}/close-blind`, {
      declaredPhysicalBalance,
      notes,
    });
    return res.data;
  },

  async getShiftHistory(branchId: string): Promise<CashShift[]> {
    const res = await apiClient.get('/api/v1/billing/shifts/history', {
      params: { branchId },
    });
    return res.data;
  },

  async createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
    const res = await apiClient.post('/api/v1/billing/invoices', payload);
    return res.data;
  },

  async getInvoices(params: any = {}): Promise<{ data: Invoice[]; meta: any }> {
    const res = await apiClient.get('/api/v1/billing/invoices', { params });
    return res.data;
  },

  async getInvoiceById(id: string): Promise<Invoice> {
    const res = await apiClient.get(`/api/v1/billing/invoices/${id}`);
    return res.data;
  },
};

