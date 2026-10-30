import { BlindCloseResult, CashShift } from '../../types/billing.types';

export interface BlindCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: BlindCloseResult) => void;
  shift: CashShift;
}

