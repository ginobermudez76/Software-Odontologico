import { Prescription, MedicationItem } from '../../types/consent-prescription.types';

export interface PrescriptionManagerProps {
  patientId?: string;
  patientName?: string;
  patientAlerts?: string[];
  canWrite?: boolean;
  onPrescriptionCreated?: (prescription: Prescription) => void;
}

export interface AllergyConflictModalState {
  isOpen: boolean;
  warningDetail: string;
}

