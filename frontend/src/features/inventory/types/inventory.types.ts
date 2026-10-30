export type StockStatus = 'OPTIMO' | 'BAJO' | 'CRITICO';

export type BatchAlertLevel =
  | 'CADUCADO'
  | 'URGENTE_15_DIAS'
  | 'ALERTA_30_DIAS'
  | 'PREVENTIVO_60_DIAS';

export interface NextExpiringBatch {
  id: string;
  batchNumber: string;
  expirationDate: string;
  availableQuantity: number;
}

export interface ClinicalSupply {
  id: string;
  sku: string;
  name: string;
  brand?: string;
  unit: string;
  minStock: number;
  currentStock: number;
  stockStatus: StockStatus;
  activeBatchesCount: number;
  nextExpiringBatch: NextExpiringBatch | null;
  nextExpirationDays: number | null;
  updatedAt: string;
}

export interface ExpiringBatchItem {
  id: string;
  supplyId: string;
  supplyName: string;
  supplySku: string;
  unit: string;
  batchNumber: string;
  availableQuantity: number;
  expirationDate: string;
  daysRemaining: number;
  alertLevel: BatchAlertLevel;
}

export interface CreateSupplyPayload {
  sku: string;
  name: string;
  brand?: string;
  unit: string;
  minStock?: number;
}

export interface AddBatchPayload {
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  unitCost: number;
}

export interface RecipeSupplyItem {
  supplyId: string;
  quantity: number;
}

export interface ConfigureRecipePayload {
  supplies: RecipeSupplyItem[];
}

