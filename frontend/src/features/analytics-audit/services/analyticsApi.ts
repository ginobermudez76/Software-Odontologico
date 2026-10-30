import { apiClient } from '../../../services/api';
import {
  DirectorKpisResponse,
  AuditLogsResponse,
} from '../types/analytics-audit.types';

export const analyticsApi = {
  async getDirectorKpis(params?: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DirectorKpisResponse> {
    const res = await apiClient.get('/api/v1/analytics/kpis', { params });
    return res.data;
  },

  async getForensicAuditLogs(params?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }): Promise<AuditLogsResponse> {
    const res = await apiClient.get('/api/v1/analytics/audit-logs', { params });
    return res.data;
  },
};
