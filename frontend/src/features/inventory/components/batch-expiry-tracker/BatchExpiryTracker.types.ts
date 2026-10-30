import { BatchAlertLevel, ExpiringBatchItem } from '../../types/inventory.types';

export type FilterAlert = 'TODOS' | BatchAlertLevel;

export interface BatchExpiryTrackerProps {
  daysAhead?: number;
  onRefresh?: () => void;
}

export interface ExpirySummary {
  caducados: number;
  urgente15: number;
  alerta30: number;
  preventivo60: number;
  total: number;
}

