import { ClinicalSupply } from '../../types/inventory.types';

export interface InventoryListProps {
  canWrite?: boolean;
  onSupplyCreated?: (supply: ClinicalSupply) => void;
}

export interface NewSupplyModalState {
  isOpen: boolean;
  sku: string;
  name: string;
  brand: string;
  unit: string;
  minStock: number;
}

export interface AddBatchModalState {
  isOpen: boolean;
  supplyId: string | null;
  supplyName: string | null;
  batchNumber: string;
  expirationDate: string;
  quantity: number;
  unitCost: number;
}
