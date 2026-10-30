export type PlanStatus =
  | 'BORRADOR'
  | 'EMITIDO'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'VENCIDO';

export interface TreatmentPlanItem {
  id: string;
  phaseId: string;
  procedureId: string;
  procedure?: {
    id: string;
    code: string;
    name: string;
    category: string;
  };
  toothNumber?: number | null;
  surface?: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  labCost: number;
  finalPrice: number;
  status: 'PENDIENTE' | 'APROBADO' | 'AGENDADO' | 'COMPLETADO' | 'CANCELADO';
  appointmentId?: string | null;
  appointment?: {
    id: string;
    startDateTime: string;
    endDateTime: string;
    status: string;
  } | null;
  orderIndex: number;
}

export interface TreatmentPlanPhase {
  id: string;
  planId: string;
  phaseNumber: number;
  name: string;
  status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA';
  orderIndex: number;
  subtotal: number;
  items: TreatmentPlanItem[];
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  doctorId: string;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  planCode: string;
  title: string;
  description?: string | null;
  status: PlanStatus;
  isAlternative: boolean;
  totalAmount: number;
  issuedAt: string;
  expiresAt: string;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  isExpired?: boolean;
  daysRemaining?: number;
  phases: TreatmentPlanPhase[];
  createdAt: string;
}

export interface CreatePlanItemPayload {
  procedureId: string;
  toothNumber?: number;
  surface?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  labCost?: number;
}

export interface CreatePlanPhasePayload {
  phaseNumber: number;
  name: string;
  items: CreatePlanItemPayload[];
}

export interface CreateTreatmentPlanPayload {
  patientId: string;
  doctorId: string;
  title: string;
  description?: string;
  isAlternative?: boolean;
  phases: CreatePlanPhasePayload[];
}

export interface ConvertPlanItemPayload {
  branchId: string;
  chairId: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
}

// Modelos de Comisiones y Honorarios Médicos (RN-07)
export interface CommissionRule {
  id: string;
  doctorId: string;
  procedureId?: string | null;
  ruleType: 'PERCENTAGE_NET' | 'FIXED_AMOUNT';
  percentage?: number | null;
  fixedAmount?: number | null;
  isActive: boolean;
  procedure?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface SettlementItem {
  id?: string;
  appointmentId?: string;
  procedureId: string;
  procedureName: string;
  procedureCode: string;
  procedurePrice: number;
  labCost: number; // RN-07: Costo deducido de laboratorio
  commissionableBase: number;
  commissionRate: number;
  doctorEarning: number;
}

export interface SettlementPreview {
  doctorId: string;
  doctorName: string;
  periodStart: string;
  periodEnd: string;
  totalProceduresCount: number;
  grossAmount: number;
  totalLabCosts: number;
  netCommissionableBase: number;
  netCommissionPaid: number;
  items: SettlementItem[];
}

export interface CommissionSettlement {
  id: string;
  settlementCode: string;
  doctorId: string;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  periodStart: string;
  periodEnd: string;
  totalProceduresCount: number;
  grossAmount: number;
  totalLabCosts: number;
  netCommissionableBase: number;
  netCommissionPaid: number;
  status: 'PENDIENTE' | 'APROBADO' | 'PAGADO' | 'ANULADO';
  paidAt?: string | null;
  notes?: string | null;
  createdAt: string;
  items: SettlementItem[];
}
