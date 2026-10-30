import { CommissionSettlement, SettlementPreview } from '../../types/treatment-plans-commissions.types';

export interface DoctorOption {
  id: string;
  name: string;
  email?: string;
}

export interface DoctorSettlementManagerProps {
  canWrite?: boolean;
  doctors?: DoctorOption[];
  onSettlementGenerated?: (settlement: CommissionSettlement) => void;
}

