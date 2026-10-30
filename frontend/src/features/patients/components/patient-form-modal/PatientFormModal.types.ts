import { PatientFormData, PatientListItem } from '../../types/patient.types';

export interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: PatientListItem | null;
}

