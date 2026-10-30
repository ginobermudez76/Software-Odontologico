import { TreatmentPlan, CreateTreatmentPlanPayload } from '../../types/treatment-plans-commissions.types';

export interface TreatmentPlanBuilderProps {
  patientId?: string;
  doctorId?: string;
  canWrite?: boolean;
  onPlanCreated?: (plan: TreatmentPlan) => void;
}

export interface NewPlanDraftState {
  title: string;
  description: string;
  isAlternative: boolean;
  phases: {
    phaseNumber: number;
    name: string;
    items: {
      procedureId: string;
      procedureName: string;
      toothNumber?: number;
      surface?: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
      labCost: number;
    }[];
  }[];
}
